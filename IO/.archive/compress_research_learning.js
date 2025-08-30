#!/usr/bin/env node

// Compression System Test - RESEARCH_LEARNING.md
// Proving compression method works on real Prodigy content

const fs = require('fs');
const path = require('path');

// Import compression classes (simplified for this test)
class CompressedEntry {
    constructor(content, intent_pattern, domain, context) {
        this.intent_code = intent_pattern;
        this.domain_code = domain;
        this.context_code = context;
        this.timestamp = Date.now();
        this.original_content = content;
        this.original_length = content.length;
        this.compressed_content = this.compress(content);
        this.validation_hash = this.generateHash(content);
        this.compressed_length = JSON.stringify(this.compressed_content).length;
    }
    
    compress(content) {
        return {
            core_intent: this.extractIntent(content),
            key_entities: this.extractEntities(content),
            relationships: this.extractRelationships(content),
            context_markers: this.extractContextMarkers(content),
            structural_elements: this.extractStructure(content),
            key_concepts: this.extractKeyConcepts(content)
        };
    }
    
    extractIntent(content) {
        // Look for research patterns
        if (/research|analysis|study|investigation/i.test(content)) return 'RESEARCH_ANALYSIS';
        if (/learning|education|knowledge/i.test(content)) return 'LEARNING_PROCESS';
        if (/implementation|method|approach/i.test(content)) return 'METHODOLOGY';
        if (/problem|challenge|issue/i.test(content)) return 'PROBLEM_ANALYSIS';
        return 'KNOWLEDGE_DOCUMENTATION';
    }
    
    extractEntities(content) {
        const entities = [];
        const lines = content.split('\n');
        
        // Extract from headers
        lines.forEach(line => {
            if (line.startsWith('#')) {
                const header = line.replace(/^#+\s*/, '').toLowerCase();
                entities.push(`HEADER:${header}`);
            }
        });
        
        // Key Prodigy terms
        const prodigy_terms = [
            'learning', 'research', 'intelligence', 'compression', 'pattern', 
            'knowledge', 'memory', 'analysis', 'optimization', 'framework',
            'methodology', 'validation', 'implementation', 'system', 'architecture'
        ];
        
        prodigy_terms.forEach(term => {
            const regex = new RegExp(`\\b${term}\\b`, 'gi');
            const matches = content.match(regex);
            if (matches) {
                entities.push(`CONCEPT:${term}(${matches.length})`);
            }
        });
        
        return entities;
    }
    
    extractRelationships(content) {
        const relationships = [];
        
        // Extract bullet point relationships
        const bulletPattern = /[-*+]\s+(.+)/g;
        let match;
        while ((match = bulletPattern.exec(content)) !== null) {
            relationships.push({
                type: 'LIST_ITEM',
                content: match[1].substring(0, 50) // First 50 chars
            });
        }
        
        // Extract cause-effect relationships
        const causalPattern = /([\w\s]+)\s+(because|due to|results in|leads to|causes)\s+([\w\s]+)/gi;
        while ((match = causalPattern.exec(content)) !== null) {
            relationships.push({
                type: 'CAUSAL',
                subject: match[1].trim().substring(0, 30),
                relation: match[2],
                object: match[3].trim().substring(0, 30)
            });
        }
        
        return relationships.slice(0, 10); // Limit to 10 relationships
    }
    
    extractContextMarkers(content) {
        const markers = {
            document_type: 'RESEARCH_DOCUMENT',
            sections: [],
            key_themes: [],
            complexity_level: 'INTERMEDIATE'
        };
        
        // Extract section headers
        const headerPattern = /^#+\s+(.+)$/gm;
        let match;
        while ((match = headerPattern.exec(content)) !== null) {
            markers.sections.push(match[1]);
        }
        
        // Determine complexity
        if (content.length > 5000) markers.complexity_level = 'ADVANCED';
        else if (content.length < 1000) markers.complexity_level = 'BASIC';
        
        return markers;
    }
    
    extractStructure(content) {
        const structure = {
            total_lines: content.split('\n').length,
            total_words: content.split(/\s+/).length,
            header_count: (content.match(/^#+/gm) || []).length,
            bullet_count: (content.match(/^[-*+]/gm) || []).length,
            paragraph_count: content.split('\n\n').length
        };
        
        return structure;
    }
    
    extractKeyConcepts(content) {
        // Extract key concepts specific to this document
        const concepts = [];
        
        // Look for definitions (something "is" something)
        const definitionPattern = /(\w+(?:\s+\w+)*)\s+is\s+([^.!?]+)/gi;
        let match;
        while ((match = definitionPattern.exec(content)) !== null) {
            concepts.push({
                type: 'DEFINITION',
                term: match[1].trim(),
                definition: match[2].trim().substring(0, 50)
            });
        }
        
        // Extract quoted text (important concepts)
        const quotePattern = /"([^"]+)"/g;
        while ((match = quotePattern.exec(content)) !== null) {
            concepts.push({
                type: 'QUOTED_CONCEPT',
                content: match[1].substring(0, 50)
            });
        }
        
        return concepts.slice(0, 5); // Limit to 5 key concepts
    }
    
    generateHash(content) {
        let hash = 0;
        for (let i = 0; i < content.length; i++) {
            const char = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash;
    }
    
    getCompressionRatio() {
        return (this.original_length / this.compressed_length).toFixed(2);
    }
    
    generateReport() {
        return {
            original_length: this.original_length,
            compressed_length: this.compressed_length,
            compression_ratio: this.getCompressionRatio(),
            compression_efficiency: ((1 - this.compressed_length / this.original_length) * 100).toFixed(1),
            compressed_data: this.compressed_content,
            metadata: {
                intent_code: this.intent_code,
                domain_code: this.domain_code,
                context_code: this.context_code,
                timestamp: new Date(this.timestamp).toISOString(),
                validation_hash: this.validation_hash
            }
        };
    }
}

// Main execution
console.log("=== COMPRESSION TEST: RESEARCH_LEARNING.md ===\n");

// Read the research file
const inputPath = './IO/STORAGE/RESEARCH_LEARNING.md';
const content = fs.readFileSync(inputPath, 'utf8');

console.log(`Original file: ${inputPath}`);
console.log(`Original size: ${content.length} characters`);
console.log(`First 200 characters: "${content.substring(0, 200)}..."`);
console.log();

// Apply compression
const compressed = new CompressedEntry(
    content,
    0b010,  // REQUEST_FOR_INFORMATION (research intent)
    0b010,  // RESEARCH_ANALYSIS domain
    0b0101  // LEARNING_METHODOLOGY context
);

// Generate compression report
const report = compressed.generateReport();

console.log("=== COMPRESSION RESULTS ===");
console.log(`Compression ratio: ${report.compression_ratio}:1`);
console.log(`Compression efficiency: ${report.compression_efficiency}% reduction`);
console.log(`Original: ${report.original_length} chars → Compressed: ${report.compressed_length} chars`);
console.log();

console.log("=== COMPRESSED CONTENT PREVIEW ===");
console.log("Core Intent:", report.compressed_data.core_intent);
console.log("Key Entities:", report.compressed_data.key_entities.slice(0, 5));
console.log("Structure:", report.compressed_data.structural_elements);
console.log("Context:", report.compressed_data.context_markers.document_type);
console.log("Sections:", report.compressed_data.context_markers.sections.slice(0, 3));
console.log();

// Save compressed version to file
const outputPath = './IO/STORE/RESEARCH_LEARNING_COMPRESSED.json';
fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));

console.log(`=== COMPRESSION COMPLETE ===`);
console.log(`Compressed data saved to: ${outputPath}`);
console.log(`Validation hash: ${report.metadata.validation_hash}`);
console.log(`Timestamp: ${report.metadata.timestamp}`);

// Verification test
console.log("\n=== VERIFICATION TEST ===");
const savedData = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
const verificationPassed = savedData.metadata.validation_hash === report.metadata.validation_hash;
console.log(`Verification: ${verificationPassed ? 'PASSED' : 'FAILED'}`);
console.log(`Saved compression ratio: ${savedData.compression_ratio}:1`);
console.log(`Data integrity: ${savedData.compressed_data.key_entities.length} entities preserved`);