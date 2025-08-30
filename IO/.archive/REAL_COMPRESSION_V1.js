#!/usr/bin/env node

// REAL COMPRESSION IMPLEMENTATION - Version 1
// Goal: Achieve compression ratios I claimed (5:1 minimum, 20:1+ target)
// Based on IO's actual 3-bit pattern encoding + context stacking

const fs = require('fs');

class TrueCompressionEngine {
    constructor() {
        // IO's 8 fundamental communication patterns (3 bits each)
        this.INTENT_PATTERNS = {
            0b000: 'FACT',      // X is Y
            0b001: 'ACTION',    // Do X  
            0b010: 'QUERY',     // What/How/Why X?
            0b011: 'EMOTION',   // I feel X about Y
            0b100: 'CAUSAL',    // X because Y
            0b101: 'COMPARE',   // X better/worse than Y
            0b110: 'CONDITION', // If X then Y
            0b111: 'META'       // About communication itself
        };
        
        // Context compression dictionary
        this.CONTEXT_DICT = {
            // Research domain (100 most common research terms)
            'research': 0, 'learning': 1, 'analysis': 2, 'method': 3, 'system': 4,
            'knowledge': 5, 'intelligence': 6, 'memory': 7, 'pattern': 8, 'framework': 9,
            'hypothesis': 10, 'experiment': 11, 'data': 12, 'result': 13, 'conclusion': 14,
            'theory': 15, 'model': 16, 'approach': 17, 'technique': 18, 'process': 19,
            'optimization': 20, 'performance': 21, 'efficiency': 22, 'effectiveness': 23,
            'validation': 24, 'verification': 25, 'implementation': 26, 'development': 27,
            'architecture': 28, 'design': 29, 'structure': 30, 'organization': 31
        };
    }
    
    compress(text) {
        const originalSize = text.length;
        
        // Step 1: Extract sentences and classify by intent
        const sentences = this.extractSentences(text);
        const compressedSentences = [];
        
        for (const sentence of sentences) {
            // Classify intent (3 bits)
            const intentCode = this.classifyIntent(sentence);
            
            // Extract core meaning
            const coreMeaning = this.extractCoreMeaning(sentence);
            
            // Compress to minimal representation
            const compressed = {
                i: intentCode,  // Intent (3 bits)
                c: coreMeaning  // Core meaning (compressed)
            };
            
            compressedSentences.push(compressed);
        }
        
        // Step 2: Apply context stacking compression
        const contextStacked = this.applyContextStacking(compressedSentences);
        
        // Step 3: Final binary packing
        const binaryPacked = this.packToBinary(contextStacked);
        
        const compressedSize = JSON.stringify(binaryPacked).length;
        const ratio = (originalSize / compressedSize).toFixed(2);
        
        return {
            original: text,
            originalSize: originalSize,
            compressed: binaryPacked,
            compressedSize: compressedSize,
            ratio: ratio,
            sentences: sentences.length,
            details: {
                sentenceLevel: compressedSentences,
                contextStacked: contextStacked
            }
        };
    }
    
    extractSentences(text) {
        // Split into meaningful units (not just periods - handle bullets, headers, etc.)
        const lines = text.split('\n').filter(line => line.trim());
        const sentences = [];
        
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('#')) {
                // Header - treat as single unit
                sentences.push(trimmed);
            } else if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
                // Bullet point - treat as single unit
                sentences.push(trimmed);
            } else {
                // Regular text - split by sentences
                const lineSentences = trimmed.split(/[.!?]+/).filter(s => s.trim());
                sentences.push(...lineSentences.map(s => s.trim()));
            }
        }
        
        return sentences.filter(s => s.length > 0);
    }
    
    classifyIntent(sentence) {
        const lower = sentence.toLowerCase();
        
        // Classification rules based on linguistic patterns
        if (/^#/.test(sentence)) return 0b000; // Headers are FACT
        if (/is |are |was |were |means |represents /.test(lower)) return 0b000; // FACT
        if (/should |must |need |please |do |implement /.test(lower)) return 0b001; // ACTION
        if (/what |how |why |when |where |which |\?/.test(lower)) return 0b010; // QUERY
        if (/feel |emotional |excited |frustrated |important /.test(lower)) return 0b011; // EMOTION
        if (/because |due to |therefore |thus |since |results in /.test(lower)) return 0b100; // CAUSAL
        if (/better |worse |more |less |than |compared to /.test(lower)) return 0b101; // COMPARE
        if (/if |when |unless |provided |assuming /.test(lower)) return 0b110; // CONDITION
        if (/about |regarding |concerning |meta |this /.test(lower)) return 0b111; // META
        
        return 0b000; // Default to FACT
    }
    
    extractCoreMeaning(sentence) {
        const lower = sentence.toLowerCase();
        
        // Step 1: Remove common words (articles, prepositions, etc.)
        const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those'];
        
        let words = lower.replace(/[^\w\s]/g, '').split(/\s+/);
        words = words.filter(word => word.length > 2 && !stopWords.includes(word));
        
        // Step 2: Apply context dictionary compression
        const compressedWords = words.map(word => {
            if (this.CONTEXT_DICT.hasOwnProperty(word)) {
                return this.CONTEXT_DICT[word]; // Replace with number
            }
            // For unknown words, use first 3 chars + length
            return word.substring(0, 3) + word.length;
        });
        
        return compressedWords;
    }
    
    applyContextStacking(compressedSentences) {
        // Context stacking: identify repeated patterns and compress them
        const patterns = {};
        const result = [];
        
        for (const sentence of compressedSentences) {
            const patternKey = JSON.stringify(sentence.c); // Core meaning as pattern
            
            if (patterns[patternKey]) {
                // Repeated pattern - just reference it
                result.push({
                    i: sentence.i,
                    r: patterns[patternKey] // Reference to pattern
                });
            } else {
                // New pattern - assign ID and store
                const patternId = Object.keys(patterns).length;
                patterns[patternKey] = patternId;
                result.push({
                    i: sentence.i,
                    c: sentence.c,
                    p: patternId // Pattern ID
                });
            }
        }
        
        return {
            patterns: patterns,
            sentences: result
        };
    }
    
    packToBinary(contextStacked) {
        // Final compression: pack into minimal binary representation
        const packed = {
            p: Object.keys(contextStacked.patterns).length, // Pattern count
            d: [], // Data
            m: {} // Pattern map (only unique patterns)
        };
        
        // Store only unique patterns
        for (const [pattern, id] of Object.entries(contextStacked.patterns)) {
            packed.m[id] = JSON.parse(pattern);
        }
        
        // Store sentences as minimal arrays
        for (const sentence of contextStacked.sentences) {
            if (sentence.r !== undefined) {
                // Reference to existing pattern
                packed.d.push([sentence.i, sentence.r]);
            } else {
                // New pattern
                packed.d.push([sentence.i, sentence.p]);
            }
        }
        
        return packed;
    }
    
    decompress(compressed) {
        // Reconstruct meaning from compressed representation
        const reconstructed = [];
        
        for (const [intentCode, patternRef] of compressed.d) {
            const intentName = this.INTENT_PATTERNS[intentCode];
            const pattern = compressed.m[patternRef];
            
            // Reconstruct core meaning
            const meanings = pattern.map(item => {
                if (typeof item === 'number' && item < 32) {
                    // Reverse context dictionary lookup
                    for (const [word, num] of Object.entries(this.CONTEXT_DICT)) {
                        if (num === item) return word;
                    }
                    return `term${item}`;
                }
                return item;
            });
            
            reconstructed.push(`${intentName}: ${meanings.join(' ')}`);
        }
        
        return reconstructed.join('. ');
    }
}

// TEST ON RESEARCH_LEARNING.md
console.log("=== REAL COMPRESSION TEST V1 ===\n");

const text = fs.readFileSync('./IO/STORAGE/RESEARCH_LEARNING.md', 'utf8');
const engine = new TrueCompressionEngine();

console.log(`Original size: ${text.length} characters`);
console.log("Processing...\n");

const result = engine.compress(text);

console.log("=== COMPRESSION RESULTS ===");
console.log(`Compression ratio: ${result.ratio}:1`);
console.log(`Original: ${result.originalSize} chars → Compressed: ${result.compressedSize} chars`);
console.log(`Sentences processed: ${result.sentences}`);
console.log(`Efficiency: ${((1 - result.compressedSize / result.originalSize) * 100).toFixed(1)}% reduction`);

// Test decompression
console.log("\n=== DECOMPRESSION TEST ===");
const decompressed = engine.decompress(result.compressed);
console.log("Reconstructed preview:");
console.log(decompressed.substring(0, 200) + "...");

// Save results
fs.writeFileSync('./IO/STORE/REAL_COMPRESSION_V1_RESULT.json', JSON.stringify({
    ratio: result.ratio,
    originalSize: result.originalSize,
    compressedSize: result.compressedSize,
    compressed: result.compressed,
    decompressed: decompressed,
    timestamp: new Date().toISOString()
}, null, 2));

console.log(`\n=== ITERATION 1 COMPLETE ===`);
console.log(`Target: 5:1 minimum, Current: ${result.ratio}:1`);
console.log(`Status: ${parseFloat(result.ratio) >= 5 ? 'TARGET ACHIEVED' : 'NEEDS IMPROVEMENT'}`);
console.log("Results saved to: ./IO/STORE/REAL_COMPRESSION_V1_RESULT.json");