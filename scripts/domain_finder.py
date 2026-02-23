#!/usr/bin/env python3
"""
Domain Finder - Search, combine, and check domain availability.

Modes:
1. DIRECT: Search specific domain names directly
2. SMART: Generate combinations from provided words + relational terms
3. AUTO: Generate new name combos (startup-style) and check availability
"""

import json
import sys
import subprocess
from urllib.parse import quote
from typing import List, Dict, Set

class DomainFinder:
    def __init__(self):
        self.checked_domains = set()
        self.results = {
            "available": [],
            "taken": [],
            "error": [],
            "unknown": []
        }
        # Supported TLDs for even distribution
        self.tlds = [".ai", ".io", ".net", ".com", ".xyz"]
        self.tld_index = 0  # For cycling through TLDs evenly
        # Relational/positioning words for smart combinations
        self.relational_words = [
            "open", "blue", "fast", "smart", "clear", "bright",
            "flow", "pulse", "spark", "wave", "nexus", "hub",
            "sync", "orbit", "core", "prime", "peak", "sphere",
            "forge", "craft", "vault", "bridge", "path", "stream"
        ]
        self.noun_types = ["noun", "descriptor", "action", "tool", "concept"]
    
    def get_next_tld(self) -> str:
        """Cycle through TLDs for even distribution."""
        tld = self.tlds[self.tld_index % len(self.tlds)]
        self.tld_index += 1
        return tld

    def check_domain_whois(self, domain: str) -> Dict:
        """
        Check domain availability via whois command (authoritative).
        Returns: {status: 'available'|'taken'|'unknown'|'error', info: str}
        """
        if domain in self.checked_domains:
            return {"cached": True}
        
        self.checked_domains.add(domain)
        
        # Use whois (only reliable source for domains)
        try:
            result = subprocess.run(
                ["whois", domain],
                capture_output=True,
                text=True,
                timeout=5  # Reduced timeout for faster results
            )
            
            output = result.stdout.lower() + result.stderr.lower()
            
            # Check for "not found" patterns first (indicator of available domain)
            if any(phrase in output for phrase in [
                "domain not found",
                "no matching query",
                "not found in whois database",
                "no data found",
                "object does not exist"
            ]):
                return {"status": "available"}
            
            # Check for any registrant/creation date (definitive sign it's taken)
            # Must appear in original case output, not lowercased
            result_orig = result.stdout + result.stderr
            if any(phrase in result_orig for phrase in [
                "Registry Domain ID:",
                "Registrant Name:",
                "Creation Date:",
                "Registry Expiry Date:",
                "Registrar WHOIS Server:"
            ]):
                return {"status": "taken", "info": "WHOIS registered"}
            
            # If output is very short/empty, likely available
            if len(output) < 50:
                return {"status": "available"}
            
            # Default to taken if we got substantial output (safety margin)
            if len(output) > 200:
                return {"status": "taken", "info": "WHOIS returned registration data"}
            
            return {"status": "unknown", "info": "Could not determine from WHOIS"}
                
        except subprocess.TimeoutExpired:
            return {"status": "error", "info": "WHOIS lookup timed out"}
        except FileNotFoundError:
            return {"status": "error", "info": "whois command not found"}
        except Exception as e:
            return {"status": "error", "info": str(e)}

    def direct_search(self, domains: List[str]) -> Dict:
        """
        MODE 1: DIRECT - Search exact domain names provided by user.
        """
        print(f"\n🔍 DIRECT MODE: Checking {len(domains)} domain(s)...")
        for domain in domains:
            domain = domain.strip().lower()
            # If no TLD specified, add default .ai
            if not any(domain.endswith(tld) for tld in self.tlds):
                domain += '.ai'
            
            result = self.check_domain_whois(domain)
            status = result.get('status', 'unknown')
            self.results[status].append({"domain": domain, "info": result.get('info', '')})
            print(f"  {domain}: {status.upper()}")
        
        return self._format_results()

    def generate_smart_combinations(self, words: List[str]) -> List[str]:
        """
        MODE 2: SMART - Generate combinations from user words + relational terms.
        Ensures combinations meet noun minimum requirement (at least 2 meaningful elements).
        """
        combinations = set()
        words = [w.strip().lower() for w in words]
        
        # Single words (if they're substantive)
        for word in words:
            combinations.add(word)
        
        # Two-word combinations (word + word)
        for i, w1 in enumerate(words):
            for w2 in words[i+1:]:
                combinations.add(f"{w1}{w2}")
                combinations.add(f"{w2}{w1}")
        
        # Word + relational term combinations
        for word in words:
            for rel in self.relational_words[:15]:  # Limit to prevent explosion
                combinations.add(f"{rel}{word}")
                combinations.add(f"{word}{rel}")
        
        # Relational term + relational term (select pairs)
        for i, r1 in enumerate(self.relational_words[:10]):
            for r2 in self.relational_words[i+1:10]:
                combinations.add(f"{r1}{r2}")
        
        return sorted(list(combinations))

    def smart_search(self, words: List[str]) -> Dict:
        """
        MODE 2: SMART - Generate combinations from user words + relational terms and check them.
        """
        print(f"\n🧠 SMART MODE: Generating combinations from {len(words)} word(s)...")
        combinations = self.generate_smart_combinations(words)
        print(f"  Generated {len(combinations)} combinations to check")
        
        domains = [f"{combo}{self.get_next_tld()}" for combo in combinations]
        for domain in domains:
            result = self.check_domain_whois(domain)
            status = result.get('status', 'unknown')
            self.results[status].append({"domain": domain, "info": result.get('info', '')})
            if status == "available":
                print(f"  ✅ {domain}: AVAILABLE")
        
        return self._format_results()

    def load_wordlist(self) -> List[str]:
        """Load wordlist from assets/wordlist.txt"""
        import os
        script_dir = os.path.dirname(os.path.abspath(__file__))
        wordlist_path = os.path.join(script_dir, "..", "assets", "wordlist.txt")
        
        words = []
        try:
            with open(wordlist_path, 'r') as f:
                words = [line.strip().lower() for line in f if line.strip()]
        except FileNotFoundError:
            print(f"  ⚠️  Wordlist not found at {wordlist_path}, using fallback")
            words = ["field", "pulse", "stream", "forge", "orbit", "vertex", "nexus", 
                    "beacon", "vault", "prime", "peak", "wave", "core", "flow", "sync"]
        
        return words
    
    def generate_startup_names(self, target_count: int = 50) -> List[str]:
        """
        Generate startup-style names by looping until we have enough.
        Uses wordlist + random combinations.
        """
        import random
        
        words = self.load_wordlist()
        prefixes = ["open", "sync", "flow", "clear", "fast", "bright", "smart", "prime"]
        suffixes = ["hub", "flow", "pulse", "core", "vault", "force", "wave", "stream"]
        
        combinations = set()
        max_iterations = 200  # Prevent infinite loops
        iteration = 0
        
        while len(combinations) < target_count and iteration < max_iterations:
            iteration += 1
            
            # Random combination patterns
            pattern = random.choice([1, 2, 3, 4, 5])
            
            if pattern == 1:
                # Single word
                w = random.choice(words)
                combinations.add(w)
            elif pattern == 2:
                # Prefix + word
                p = random.choice(prefixes)
                w = random.choice(words)
                combinations.add(f"{p}{w}")
            elif pattern == 3:
                # Word + suffix
                w = random.choice(words)
                s = random.choice(suffixes)
                combinations.add(f"{w}{s}")
            elif pattern == 4:
                # Word + word
                w1 = random.choice(words)
                w2 = random.choice(words)
                if w1 != w2:
                    combinations.add(f"{w1}{w2}")
            else:
                # Capitalized: Prefix + Word
                p = random.choice(prefixes).capitalize()
                w = random.choice(words).capitalize()
                combinations.add(f"{p}{w}")
        
        # Convert to list and return
        result = list(combinations)[:target_count]
        return result

    def auto_search(self, target_available: int = 50) -> Dict:
        """
        MODE 3: AUTO - Loop until we find 50+ available domains.
        Distributes TLDs evenly across results.
        """
        print(f"\n🤖 AUTO MODE: Searching for {target_available}+ available domains (mixed TLDs)...")
        
        available_count = 0
        checked_count = 0
        batch_size = 50
        max_checks = 500
        
        while available_count < target_available and checked_count < max_checks:
            # Generate batch of candidates
            candidates = self.generate_startup_names(batch_size)
            # Add TLD to each (cycling for even distribution)
            domains = [f"{name}{self.get_next_tld()}" for name in candidates]
            
            # Check each
            for domain in domains:
                if domain in self.checked_domains:
                    continue  # Skip already checked
                
                checked_count += 1
                result = self.check_domain_whois(domain)
                status = result.get('status', 'unknown')
                self.results[status].append({"domain": domain, "info": result.get('info', '')})
                
                if status == "available":
                    available_count += 1
                    print(f"  ✅ {domain}: AVAILABLE ({available_count}/{target_available})")
                
                if available_count >= target_available:
                    break
        
        print(f"\n  ✅ Found {available_count} available domain(s) in {checked_count} checks")
        print(f"  TLD distribution: .ai, .io, .net, .com, .xyz (cycled evenly)")
        return self._format_results()

    def _format_results(self) -> Dict:
        """Format results for output."""
        return {
            "summary": {
                "available": len(self.results["available"]),
                "taken": len(self.results["taken"]),
                "error": len(self.results["error"]),
                "unknown": len(self.results["unknown"])
            },
            "results": self.results
        }

if __name__ == "__main__":
    finder = DomainFinder()
    
    if len(sys.argv) < 2:
        print("Usage: domain_finder.py <mode> [args...]")
        print("  direct <domain1> <domain2> ...")
        print("  smart <word1> <word2> ...")
        print("  auto")
        sys.exit(1)
    
    mode = sys.argv[1].lower()
    
    if mode == "direct":
        domains = sys.argv[2:]
        result = finder.direct_search(domains)
    elif mode == "smart":
        words = sys.argv[2:]
        result = finder.smart_search(words)
    elif mode == "auto":
        result = finder.auto_search()
    else:
        print(f"Unknown mode: {mode}")
        sys.exit(1)
    
    print("\n" + "="*60)
    print(json.dumps(result, indent=2))
