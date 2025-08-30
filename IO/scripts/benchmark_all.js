#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Import compression engine class directly
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
            originalSize: originalSize,
            compressedSize: compressedSize,
            ratio: (originalSize / compressedSize).toFixed(2),
            templateUsed: templateId,
            uniqueContentCount: uniqueContent.length
        };
    }
    
    analyzeDocumentStructure(text) {
        const lines = text.split('\\n').filter(line => line.trim());
        const structure = {
            headers: [],
            totalLines: lines.length,
            bulletPoints: 0,
            questions: 0,
            hypotheses: 0
        };
        
        for (const line of lines) {
            if (line.startsWith('#')) {
                structure.headers.push(line.replace(/^#+\\s*/, ''));
            }
            if (line.includes('?')) structure.questions++;
            if (line.includes('-') || line.includes('*')) structure.bulletPoints++;
            if (/hypothesis|predict/i.test(line)) structure.hypotheses++;
        }
        
        return structure;
    }
    
    identifyTemplate(analysis) {
        if (analysis.hypotheses > 0 && analysis.questions > 2) return 1;
        if (analysis.headers.length > 5 && analysis.bulletPoints > 10) return 0;
        if (analysis.questions > 0) return 2;
        return 0;
    }
    
    extractTemplateVariables(text, templateId) {
        const variables = {};
        
        const firstHeader = text.match(/^#\\s*(.+)$/m);
        if (firstHeader) {
            variables.TOPIC = this.compressText(firstHeader[1]);
        }
        
        const sections = [];
        const headerMatches = text.match(/^#+\\s*(.+)$/gm);
        if (headerMatches) {
            sections.push(...headerMatches.map(h => this.compressText(h.replace(/^#+\\s*/, ''))));
        }
        variables.SECTIONS = sections.slice(0, 6);
        
        const concepts = this.extractKeyConcepts(text);
        variables.CONCEPTS = concepts.slice(0, 5);
        
        return variables;
    }
    
    compressText(text) {
        const words = text.toLowerCase()
            .replace(/[^\\w\\s]/g, '')
            .split(/\\s+/)
            .filter(word => word.length > 3)
            .filter(word => !['this', 'that', 'with', 'from', 'they', 'them', 'have', 'been', 'were', 'will', 'what', 'when', 'where', 'which', 'would', 'could', 'should'].includes(word));
        
        return words.slice(0, 2).join(' ');
    }
    
    extractKeyConcepts(text) {
        const words = text.toLowerCase()
            .replace(/[^\\w\\s]/g, '')
            .split(/\\s+/)
            .filter(word => word.length > 4)
            .filter(word => !['learning', 'research', 'analysis', 'method', 'approach', 'system', 'development'].includes(word));
        
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
        
        const quotes = text.match(/"[^"]+"/g);
        if (quotes) {
            unique.push(...quotes.map(q => q.substring(1, q.length - 1).substring(0, 20)));
        }
        
        const numbers = text.match(/\\d+(?:\\.\\d+)?%?/g);
        if (numbers) {
            unique.push(...numbers.filter(n => parseInt(n) > 1));
        }
        
        return unique.slice(0, 5);
    }
}

console.log("=== COMPRESSION BENCHMARK - ALL DOCUMENTS ===\n");

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
        uniqueContentCount: result.uniqueContentCount
    });
    
    console.log(`  ${result.originalSize} → ${result.compressedSize} chars (${result.ratio}:1)`);
});

// Save detailed results
fs.writeFileSync('./IO/OUTPUT/benchmark_results.json', JSON.stringify(results, null, 2));

console.log(`\n=== BENCHMARK COMPLETE ===`);
console.log(`Files tested: ${results.length}`);
console.log(`Average ratio: ${(results.reduce((sum, r) => sum + r.ratio, 0) / results.length).toFixed(2)}:1`);
console.log(`Results saved to: ./IO/OUTPUT/benchmark_results.json`);