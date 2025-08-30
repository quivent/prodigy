#!/usr/bin/env node

// COMPRESSION OUTPUT MARKDOWN GENERATOR
// Creates human-readable markdown reports from JSON compression results
// Solves visibility asymmetry: JSON files invisible in markdown readers

const fs = require('fs');
const path = require('path');

class CompressionReportGenerator {
    constructor() {
        this.outputDir = './IO/OUTPUT';
        this.monitoringDir = './IO/MONITORING';
    }
    
    generateReport(version = 'V5') {
        console.log(`=== GENERATING COMPRESSION REPORT FOR ${version} ===\n`);
        
        // Read the results JSON file
        const resultsFile = `${this.outputDir}/compression_${version.toLowerCase()}_results.json`;
        
        if (!fs.existsSync(resultsFile)) {
            console.error(`Results file not found: ${resultsFile}`);
            return;
        }
        
        const results = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
        
        // Generate markdown report
        const markdown = this.createMarkdownReport(results, version);
        
        // Save report to MONITORING
        const reportFile = `${this.monitoringDir}/COMPRESSION_${version}_OUTPUT_REPORT.md`;
        fs.writeFileSync(reportFile, markdown);
        
        console.log(`Compression output report generated: ${reportFile}`);
        return reportFile;
    }
    
    createMarkdownReport(results, version) {
        const timestamp = new Date().toISOString();
        const totalDocuments = results.length;
        const avgRatio = (results.reduce((sum, r) => sum + r.ratio, 0) / totalDocuments).toFixed(2);
        const bestPerformer = results.reduce((best, current) => 
            current.ratio > best.ratio ? current : best);
        
        let markdown = `# Compression ${version} Output Report

> **Generated:** ${timestamp} | **Documents:** ${totalDocuments} | **Average Ratio:** ${avgRatio}:1

## Performance Summary

**Best Performance:** ${bestPerformer.filename} (${bestPerformer.ratio}:1 - ${((1 - bestPerformer.compressedSize / bestPerformer.originalSize) * 100).toFixed(1)}% compression)

| Document | Original | Compressed | Ratio | Strategy | Template | Compression % |
|----------|----------|------------|-------|----------|----------|---------------|
`;

        // Add table rows
        results.forEach(result => {
            const compressionPercent = ((1 - result.compressedSize / result.originalSize) * 100).toFixed(1);
            markdown += `| ${result.filename} | ${result.originalSize} | ${result.compressedSize} | **${result.ratio}:1** | ${result.strategy} | T${result.templateUsed} | **${compressionPercent}%** |\n`;
        });
        
        markdown += `\n## Compressed Data Samples\n\n`;
        
        // Add top 3 performers with their actual compressed data
        const topPerformers = results
            .sort((a, b) => b.ratio - a.ratio)
            .slice(0, 3);
            
        topPerformers.forEach((result, index) => {
            const rank = ['🥇', '🥈', '🥉'][index];
            const compressionPercent = ((1 - result.compressedSize / result.originalSize) * 100).toFixed(1);
            
            markdown += `### ${rank} ${result.filename} (${result.ratio}:1, ${compressionPercent}% compression)\n\n`;
            markdown += `**Original Size:** ${result.originalSize} characters  \n`;
            markdown += `**Compressed Size:** ${result.compressedSize} characters  \n`;
            markdown += `**Strategy:** ${result.strategy}  \n`;
            markdown += `**Template:** ${result.templateUsed}  \n\n`;
            
            if (result.compressedData) {
                markdown += `**Compressed Representation:**\n\`\`\`json\n`;
                markdown += JSON.stringify(result.compressedData, null, 2);
                markdown += `\n\`\`\`\n\n`;
                
                // Explain the compression structure
                markdown += `**Structure Explanation:**\n`;
                markdown += `- \`t: ${result.compressedData.t}\` - Template ID (${this.getTemplateDescription(result.compressedData.t)})\n`;
                if (result.compressedData.v) {
                    markdown += `- \`v\` - Variables: ${Object.keys(result.compressedData.v).length} compressed variables\n`;
                }
                if (result.compressedData.u && result.compressedData.u.length > 0) {
                    markdown += `- \`u\` - Unique content: ${result.compressedData.u.length} preserved elements\n`;
                }
                if (result.compressedData.r && Object.keys(result.compressedData.r).length > 0) {
                    markdown += `- \`r\` - Relationships: ${Object.keys(result.compressedData.r).length} semantic relationships\n`;
                }
                if (result.compressedData.m) {
                    markdown += `- \`m\` - Meta-structure: Complexity/density/structure/evidence scores\n`;
                }
                if (result.compressedData.s) {
                    markdown += `- \`s\` - Strategy: ${result.compressedData.s}\n`;
                }
            }
            
            markdown += `---\n\n`;
        });
        
        // Strategy analysis
        markdown += `## Strategy Distribution Analysis\n\n`;
        const strategies = {};
        results.forEach(result => {
            if (!strategies[result.strategy]) {
                strategies[result.strategy] = [];
            }
            strategies[result.strategy].push(result);
        });
        
        Object.entries(strategies).forEach(([strategy, docs]) => {
            const avgRatio = (docs.reduce((sum, doc) => sum + doc.ratio, 0) / docs.length).toFixed(2);
            const count = docs.length;
            const bestInStrategy = docs.reduce((best, current) => 
                current.ratio > best.ratio ? current : best);
                
            markdown += `### ${strategy} (${count} documents, ${avgRatio}:1 average)\n`;
            markdown += `**Best performer:** ${bestInStrategy.filename} (${bestInStrategy.ratio}:1)  \n`;
            markdown += `**Documents:** ${docs.map(d => d.filename).join(', ')}\n\n`;
        });
        
        // Template analysis  
        markdown += `## Template Usage Analysis\n\n`;
        const templates = {};
        results.forEach(result => {
            if (!templates[result.templateUsed]) {
                templates[result.templateUsed] = [];
            }
            templates[result.templateUsed].push(result);
        });
        
        Object.entries(templates).forEach(([template, docs]) => {
            const avgRatio = (docs.reduce((sum, doc) => sum + doc.ratio, 0) / docs.length).toFixed(2);
            const count = docs.length;
            
            markdown += `### Template ${template}: ${this.getTemplateDescription(parseInt(template))} (${count} docs, ${avgRatio}:1 avg)\n`;
            docs.forEach(doc => {
                markdown += `- ${doc.filename}: ${doc.ratio}:1\n`;
            });
            markdown += `\n`;
        });
        
        markdown += `## Individual Compressed Files Generated\n\n`;
        markdown += `The following individual compressed files are available in the OUTPUT folder:\n\n`;
        
        results.forEach(result => {
            const compressedFileName = result.filename.replace('.md', `_${version}_compressed.json`);
            markdown += `- \`${compressedFileName}\` (${result.compressedSize} bytes)\n`;
        });
        
        markdown += `\n---\n\n`;
        markdown += `> **Report Generation:** This markdown report provides human-readable access to JSON compression results, solving the visibility asymmetry between JSON files and markdown readers. Generated automatically after each compression experiment.\n`;
        
        return markdown;
    }
    
    getTemplateDescription(templateId) {
        const descriptions = {
            0: "Document about TOPIC with SECTIONS methodology",
            1: "TOPIC analysis with HYPOTHESIS and RESULTS", 
            2: "TOPIC investigation using METHOD yielding FINDINGS",
            3: "TOPIC framework with COMPONENTS and APPLICATIONS",
            4: "Mathematical TOPIC study with FORMULAS and CONCLUSIONS",
            5: "Technical TOPIC specification with PARAMETERS and IMPLEMENTATION",
            6: "TOPIC evaluation using CRITERIA and ASSESSMENT"
        };
        return descriptions[templateId] || "Unknown template";
    }
}

// Main execution
const generator = new CompressionReportGenerator();

// Get version from command line argument or default to V5
const version = process.argv[2] || 'V5';

try {
    const reportFile = generator.generateReport(version);
    console.log(`\n=== REPORT GENERATION COMPLETE ===`);
    console.log(`Markdown report created for human-readable compression analysis.`);
    console.log(`Location: ${reportFile}`);
} catch (error) {
    console.error('Error generating compression report:', error.message);
}