#!/usr/bin/env node

// COMPRESSION TEST - Shannon Information Theory Document
// Modified version of V2 engine for testing

const fs = require('fs');

class IntentCompressionEngine {
    constructor() {
        this.RESEARCH_TEMPLATES = {
            0: "Document about TOPIC with SECTIONS methodology",
            1: "TOPIC analysis with HYPOTHESIS and RESULTS", 
            2: "TOPIC investigation using METHOD yielding FINDINGS",
            3: "TOPIC framework with COMPONENTS and APPLICATIONS",
            4: "TOPIC study examining VARIABLES and CONCLUSIONS"
        };
    }
    
    compress(text) {
        const analysis = this.analyzeDocumentStructure(text);
        const templateId = this.identifyTemplate(analysis);
        const variables = this.extractTemplateVariables(text, templateId);
        const uniqueContent = this.extractUniqueContent(text, templateId, variables);
        
        const compressed = {
            t: templateId,
            v: variables,
            u: uniqueContent
        };
        
        const originalSize = text.length;
        const compressedSize = JSON.stringify(compressed).length;
        
        return {
            original: text,
            originalSize: originalSize,
            compressed: compressed,
            compressedSize: compressedSize,
            ratio: (originalSize / compressedSize).toFixed(2),
            templateUsed: templateId,
            variables: variables,
            uniqueContentCount: uniqueContent.length
        };
    }
    
    analyzeDocumentStructure(text) {
        const lines = text.split('\n').filter(line => line.trim());
        const structure = {
            headers: [],
            totalLines: lines.length,
            bulletPoints: 0,
            questions: 0,
            formulas: 0,
            definitions: 0
        };
        
        for (const line of lines) {
            if (line.startsWith('#')) {
                structure.headers.push(line.replace(/^#+\s*/, ''));
            }
            if (line.includes('?')) structure.questions++;
            if (line.includes('-') || line.includes('*')) structure.bulletPoints++;
            if (line.includes('=') || line.includes('∑') || /\b[A-Z]\s*=/.test(line)) structure.formulas++;
            if (line.includes('**Definition**:') || line.includes('**Concept**:')) structure.definitions++;
        }
        
        return structure;
    }
    
    identifyTemplate(analysis) {
        if (analysis.formulas > 2 && analysis.definitions > 2) return 2; // Investigation with technical findings
        if (analysis.questions > 2 && analysis.headers.length > 3) return 2; // Investigation format
        return 0; // Default structured document
    }
    
    extractTemplateVariables(text, templateId) {
        const variables = {};
        
        // Extract main topic
        const firstHeader = text.match(/^#\s*(.+)$/m);
        if (firstHeader) {
            variables.TOPIC = this.compressText(firstHeader[1]);
        }
        
        // Extract key mathematical concepts/formulas
        const formulas = [];
        const formulaMatches = text.match(/\*\*Formula\*\*:\s*([^*]+)/g) || 
                              text.match(/[A-Z]\([A-Z]\)\s*=\s*[^.]+/g) ||
                              text.match(/C\s*=\s*[^.]+/g);
        if (formulaMatches) {
            formulas.push(...formulaMatches.map(f => f.substring(0, 30)));
        }
        variables.FORMULAS = formulas.slice(0, 3);
        
        // Extract key concepts
        const concepts = this.extractKeyConcepts(text);
        variables.CONCEPTS = concepts.slice(0, 5);
        
        // Extract main sections
        const sections = [];
        const headerMatches = text.match(/^#+\s*(.+)$/gm);
        if (headerMatches) {
            sections.push(...headerMatches.slice(0, 6).map(h => this.compressText(h.replace(/^#+\s*/, ''))));
        }
        variables.SECTIONS = sections;
        
        return variables;
    }
    
    compressText(text) {
        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 3)
            .filter(word => !['this', 'that', 'with', 'from', 'they', 'them', 'have', 'been', 'were', 'will', 'what', 'when', 'where', 'which', 'would', 'could', 'should'].includes(word));
        
        return words.slice(0, 2).join(' ');
    }
    
    extractKeyConcepts(text) {
        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 4)
            .filter(word => !['research', 'theory', 'information', 'shannon'].includes(word));
        
        const frequency = {};
        words.forEach(word => {
            frequency[word] = (frequency[word] || 0) + 1;
        });
        
        return Object.entries(frequency)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([word]) => word);
    }
    
    extractUniqueContent(text, templateId, variables) {
        const unique = [];
        
        // Extract specific names and dates
        const names = text.match(/[A-Z][a-z]+ [A-Z][a-z]+/g);
        if (names) {
            unique.push(...names.filter(name => name.includes('Shannon')));
        }
        
        // Extract years/dates
        const dates = text.match(/\b(19|20)\d{2}\b/g);
        if (dates) {
            unique.push(...dates);
        }
        
        // Extract specific mathematical notation
        const mathNotation = text.match(/log₂|∑|H\([A-Z]\)|S\/N/g);
        if (mathNotation) {
            unique.push(...mathNotation);
        }
        
        return [...new Set(unique)].slice(0, 8); // Remove duplicates, limit to 8
    }
    
    decompress(compressed) {
        const template = this.RESEARCH_TEMPLATES[compressed.t];
        const variables = compressed.v;
        
        let reconstructed = template
            .replace('TOPIC', variables.TOPIC || 'subject')
            .replace('METHOD', 'mathematical analysis')
            .replace('FINDINGS', variables.CONCEPTS ? variables.CONCEPTS.join(', ') : 'various findings');
        
        if (compressed.u && compressed.u.length > 0) {
            reconstructed += `. Key elements: ${compressed.u.join(', ')}`;
        }
        
        if (variables.FORMULAS && variables.FORMULAS.length > 0) {
            reconstructed += `. Mathematical formulas included`;
        }
        
        if (variables.SECTIONS) {
            reconstructed += `. Sections: ${variables.SECTIONS.slice(0, 3).join(', ')}`;
        }
        
        return reconstructed;
    }
}

// EXECUTE THE TEST
console.log("=== COMPRESSION TEST: Shannon Information Theory ===\n");

const engine = new IntentCompressionEngine();
const text = fs.readFileSync('./IO/STORAGE/RESEARCH_SHANNON_INFORMATION_THEORY.md', 'utf8');

console.log(`Target file: RESEARCH_SHANNON_INFORMATION_THEORY.md`);
console.log(`Original size: ${text.length} characters`);
console.log("Processing...\n");

const result = engine.compress(text);

console.log("=== COMPRESSION RESULTS ===");
console.log(`Compression ratio: ${result.ratio}:1`);
console.log(`Original: ${result.originalSize} chars → Compressed: ${result.compressedSize} chars`);
console.log(`Efficiency: ${((1 - result.compressedSize / result.originalSize) * 100).toFixed(1)}% reduction`);
console.log(`Template: ${result.templateUsed} - ${engine.RESEARCH_TEMPLATES[result.templateUsed]}`);
console.log(`Unique elements preserved: ${result.uniqueContentCount}`);

console.log("\n=== EXTRACTED VARIABLES ===");
console.log(JSON.stringify(result.variables, null, 2));

console.log("\n=== DECOMPRESSED PREVIEW ===");
const decompressed = engine.decompress(result.compressed);
console.log(decompressed);

// Save compressed result
fs.writeFileSync('./IO/STORE/SHANNON_COMPRESSED_RESULT.json', JSON.stringify(result.compressed, null, 2));

console.log(`\n=== TEST COMPLETE ===`);
console.log(`Compressed data saved to: ./IO/STORE/SHANNON_COMPRESSED_RESULT.json`);