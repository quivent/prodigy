#!/usr/bin/env node

// REAL COMPRESSION V3 - ENHANCED TEMPLATE CLASSIFICATION
// Improved mathematical content detection and semantic analysis

const fs = require('fs');
const path = require('path');

class IntentCompressionEngine {
    constructor() {
        this.RESEARCH_TEMPLATES = {
            0: "Document about TOPIC with SECTIONS methodology",
            1: "TOPIC analysis with HYPOTHESIS and RESULTS", 
            2: "TOPIC investigation using METHOD yielding FINDINGS",
            3: "TOPIC framework with COMPONENTS and APPLICATIONS",
            4: "Mathematical TOPIC study with FORMULAS and CONCLUSIONS",
            5: "Technical TOPIC specification with PARAMETERS and IMPLEMENTATION"
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
            originalSize: originalSize,
            compressedSize: compressedSize,
            ratio: (originalSize / compressedSize).toFixed(2),
            templateUsed: templateId,
            variables: variables,
            uniqueContentCount: uniqueContent.length,
            analysis: analysis
        };
    }
    
    analyzeDocumentStructure(text) {
        const lines = text.split('\n').filter(line => line.trim());
        const structure = {
            headers: [],
            totalLines: lines.length,
            bulletPoints: 0,
            questions: 0,
            hypotheses: 0,
            formulas: 0,
            definitions: 0,
            mathematicalTerms: 0,
            codeBlocks: 0,
            citations: 0
        };
        
        for (const line of lines) {
            if (line.startsWith('#')) {
                structure.headers.push(line.replace(/^#+\s*/, ''));
            }
            if (line.includes('?')) structure.questions++;
            if (line.includes('-') || line.includes('*')) structure.bulletPoints++;
            if (/hypothesis|predict/i.test(line)) structure.hypotheses++;
            
            // Enhanced mathematical detection
            if (line.includes('=') || line.includes('∑') || /\b[A-Z]\s*=/.test(line) || 
                /log₂|entropy|shannon|bits?\/second/i.test(line)) structure.formulas++;
            if (line.includes('**Definition**:') || line.includes('**Concept**:') ||
                /\*\*.*?\*\*:\s/.test(line)) structure.definitions++;
            if (/mathematical|algorithm|equation|formula|calculation/i.test(line)) structure.mathematicalTerms++;
            if (line.includes('```') || line.includes('`')) structure.codeBlocks++;
            if (/\[\d+\]|\([12]\d{3}\)|et al\./i.test(line)) structure.citations++;
        }
        
        return structure;
    }
    
    identifyTemplate(analysis) {
        // Enhanced classification logic
        const mathScore = analysis.formulas + analysis.mathematicalTerms + analysis.definitions;
        const researchScore = analysis.hypotheses + analysis.questions + analysis.citations;
        const technicalScore = analysis.codeBlocks + analysis.definitions;
        
        if (mathScore >= 5) return 4; // Mathematical study
        if (technicalScore >= 3 && analysis.definitions >= 2) return 5; // Technical specification
        if (analysis.hypotheses > 0 && researchScore >= 4) return 1; // Analysis with hypothesis
        if (analysis.questions >= 3 && analysis.citations >= 2) return 2; // Investigation
        if (analysis.headers.length >= 4) return 3; // Framework
        return 0; // Default structured document
    }
    
    extractTemplateVariables(text, templateId) {
        const variables = {};
        
        // Enhanced topic extraction
        const firstHeader = text.match(/^#\s*(.+)$/m);
        if (firstHeader) {
            variables.TOPIC = this.compressText(firstHeader[1]);
        }
        
        // Mathematical content extraction for templates 4-5
        if (templateId >= 4) {
            const formulas = [];
            const formulaMatches = text.match(/\*\*Formula\*\*:\s*([^*]+)/g) || 
                                  text.match(/[A-Z]\([A-Z]\)\s*=\s*[^.]+/g) ||
                                  text.match(/H\([A-Z]\)\s*=\s*[^.]+/g) ||
                                  text.match(/\b\w+\s*=\s*[^.]+bits/g);
            if (formulaMatches) {
                formulas.push(...formulaMatches.slice(0, 3).map(f => this.compressText(f.substring(0, 40))));
            }
            variables.FORMULAS = formulas;
            
            // Extract parameters/constants
            const constants = text.match(/\b\d+\s*(?:bits?|Hz|%|seconds?|characters?)/g);
            if (constants) {
                variables.PARAMETERS = constants.slice(0, 5);
            }
        }
        
        // Enhanced section extraction
        const sections = [];
        const headerMatches = text.match(/^#+\s*(.+)$/gm);
        if (headerMatches) {
            sections.push(...headerMatches.slice(0, 6).map(h => this.compressText(h.replace(/^#+\s*/, ''))));
        }
        variables.SECTIONS = sections;
        
        // Enhanced concept extraction
        const concepts = this.extractKeyConcepts(text, templateId);
        variables.CONCEPTS = concepts.slice(0, 5);
        
        return variables;
    }
    
    compressText(text) {
        // Enhanced compression for technical terms
        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 2)
            .filter(word => !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'boy', 'did', 'this', 'that', 'with', 'from', 'they', 'them', 'have', 'been', 'were', 'will', 'what', 'when', 'where', 'which', 'would', 'could', 'should'].includes(word));
        
        // Prioritize technical terms
        const technicalTerms = words.filter(word => 
            /shannon|entropy|information|compression|mathematical|algorithm|formula|equation/.test(word));
        
        if (technicalTerms.length >= 1) {
            return technicalTerms.slice(0, 2).join(' ');
        }
        
        return words.slice(0, 2).join(' ');
    }
    
    extractKeyConcepts(text, templateId) {
        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 3);
        
        // Enhanced filtering based on template type
        let excludeWords = ['research', 'analysis', 'method', 'approach', 'system', 'development'];
        if (templateId >= 4) {
            excludeWords = ['research', 'analysis', 'method', 'system']; // Keep mathematical terms
        }
        
        const filteredWords = words.filter(word => !excludeWords.includes(word));
        
        const frequency = {};
        filteredWords.forEach(word => {
            frequency[word] = (frequency[word] || 0) + 1;
        });
        
        return Object.entries(frequency)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 6)
            .map(([word]) => word);
    }
    
    extractUniqueContent(text, templateId, variables) {
        const unique = [];
        
        // Enhanced unique content extraction
        const quotes = text.match(/"[^"]+"/g);
        if (quotes) {
            unique.push(...quotes.slice(0, 2).map(q => q.substring(1, q.length - 1).substring(0, 25)));
        }
        
        // Enhanced number extraction
        const numbers = text.match(/\b\d+(?:\.\d+)?(?:\s*(?:bits?|Hz|%|seconds?|characters?))?/g);
        if (numbers) {
            unique.push(...numbers.filter(n => parseInt(n) > 1).slice(0, 4));
        }
        
        // Mathematical symbols and notation
        const mathSymbols = text.match(/log₂|∑|H\([A-Z]\)|S\/N|∈|∩|∪|≤|≥/g);
        if (mathSymbols) {
            unique.push(...mathSymbols.slice(0, 3));
        }
        
        // Names and proper nouns
        const names = text.match(/\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)+/g);
        if (names) {
            unique.push(...names.slice(0, 2));
        }
        
        return [...new Set(unique)].slice(0, 8);
    }
}

// Benchmark all files with V3 engine
console.log("=== COMPRESSION V3 - ENHANCED CLASSIFICATION ===\n");

const inputDir = './IO/INPUT';
const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.md'));
const engine = new IntentCompressionEngine();

const results = [];

files.forEach((filename) => {
    const filepath = path.join(inputDir, filename);
    const text = fs.readFileSync(filepath, 'utf8');
    
    console.log(`Testing: ${filename}`);
    const result = engine.compress(text);
    
    results.push({
        filename,
        originalSize: result.originalSize,
        compressedSize: result.compressedSize,
        ratio: parseFloat(result.ratio),
        templateUsed: result.templateUsed,
        templateName: engine.RESEARCH_TEMPLATES[result.templateUsed],
        uniqueContentCount: result.uniqueContentCount,
        analysis: result.analysis
    });
    
    console.log(`  ${result.originalSize} → ${result.compressedSize} chars (${result.ratio}:1) [Template ${result.templateUsed}]`);
});

// Save detailed results
fs.writeFileSync('./IO/OUTPUT/compression_v3_results.json', JSON.stringify(results, null, 2));

console.log(`\n=== V3 BENCHMARK COMPLETE ===`);
console.log(`Files tested: ${results.length}`);
console.log(`Average ratio: ${(results.reduce((sum, r) => sum + r.ratio, 0) / results.length).toFixed(2)}:1`);
console.log(`Best performance: ${results.sort((a,b) => b.ratio - a.ratio)[0].filename} (${results[0].ratio}:1)`);
console.log(`Template distribution:`);

const templateCounts = {};
results.forEach(r => {
    templateCounts[r.templateUsed] = (templateCounts[r.templateUsed] || 0) + 1;
});
Object.entries(templateCounts).forEach(([template, count]) => {
    console.log(`  Template ${template}: ${count} files`);
});

console.log(`Results saved to: ./IO/OUTPUT/compression_v3_results.json`);