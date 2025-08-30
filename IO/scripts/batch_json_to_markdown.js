#!/usr/bin/env node

// BATCH JSON-TO-MARKDOWN CONVERTER
// Converts ALL compressed JSON files in IO/OUTPUT to human-readable markdown
// Preserves originals while creating markdown visibility for all artifacts

const fs = require('fs');
const path = require('path');

class BatchJsonToMarkdownConverter {
    constructor() {
        this.outputDir = './IO/OUTPUT';
        this.markdownDir = './IO/OUTPUT/markdown';
        this.skipFiles = ['compression_v', 'benchmark_results.json', 'REAL_COMPRESSION_V2_RESULT.json'];
    }
    
    init() {
        console.log(`🔄 BATCH JSON-TO-MARKDOWN CONVERSION SYSTEM`);
        console.log(`📁 Source: ${this.outputDir}`);
        console.log(`📝 Target: ${this.markdownDir}`);
        
        // Create markdown directory if it doesn't exist
        if (!fs.existsSync(this.markdownDir)) {
            fs.mkdirSync(this.markdownDir, { recursive: true });
            console.log(`✅ Created markdown directory: ${this.markdownDir}`);
        }
    }
    
    getAllCompressedFiles() {
        const files = fs.readdirSync(this.outputDir);
        return files.filter(file => {
            // Include files ending with _compressed.json
            if (file.endsWith('_compressed.json')) return true;
            
            // Skip aggregate results files
            if (this.skipFiles.some(skip => file.includes(skip))) return false;
            
            // Include other JSON files
            return file.endsWith('.json');
        });
    }
    
    convertFile(jsonFile) {
        try {
            const fullPath = path.join(this.outputDir, jsonFile);
            const jsonData = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
            
            // Generate markdown content
            const markdown = this.createMarkdownFromJson(jsonData, jsonFile);
            
            // Create output filename
            const markdownFile = jsonFile.replace('.json', '.md');
            const markdownPath = path.join(this.markdownDir, markdownFile);
            
            // Write markdown file
            fs.writeFileSync(markdownPath, markdown);
            
            console.log(`✅ Converted: ${jsonFile} → ${markdownFile}`);
            return { success: true, jsonFile, markdownFile };
            
        } catch (error) {
            console.error(`❌ Failed to convert ${jsonFile}:`, error.message);
            return { success: false, jsonFile, error: error.message };
        }
    }
    
    createMarkdownFromJson(data, filename) {
        const timestamp = new Date().toISOString();
        const baseFilename = filename.replace('_compressed.json', '').replace('.json', '');
        
        // Check if this is a compressed document
        if (data.t !== undefined || data.template !== undefined) {
            return this.createCompressedDocumentMarkdown(data, filename, baseFilename, timestamp);
        }
        
        // Check if this is aggregate results
        if (Array.isArray(data)) {
            return this.createAggregateResultsMarkdown(data, filename, timestamp);
        }
        
        // Generic JSON to markdown conversion
        return this.createGenericJsonMarkdown(data, filename, timestamp);
    }
    
    createCompressedDocumentMarkdown(data, filename, baseFilename, timestamp) {
        const templateId = data.t || data.template || 'Unknown';
        const strategy = data.s || data.strategy || 'Unknown';
        
        let markdown = `# Compressed Document: ${baseFilename}
        
> **Generated:** ${timestamp}  
> **Original File:** \`${filename}\`  
> **Template ID:** ${templateId}  
> **Strategy:** ${strategy}

## Compression Structure

\`\`\`json
${JSON.stringify(data, null, 2)}
\`\`\`

## Structure Analysis

`;

        // Analyze compression components
        if (data.t !== undefined) {
            markdown += `### Template System (t: ${data.t})
- **Purpose:** Uses predefined template ${data.t} for structural compression
- **Benefit:** Eliminates repetitive document structure patterns

`;
        }
        
        if (data.v && Object.keys(data.v).length > 0) {
            markdown += `### Variables (v)
- **Count:** ${Object.keys(data.v).length} compressed variables
- **Variables:** ${Object.keys(data.v).join(', ')}
- **Benefit:** Replaces repeated content with variable references

`;
        }
        
        if (data.u && data.u.length > 0) {
            markdown += `### Unique Content (u)
- **Elements:** ${data.u.length} preserved unique elements
- **Purpose:** Maintains document-specific content that doesn't fit template patterns

`;
        }
        
        if (data.r && Object.keys(data.r).length > 0) {
            markdown += `### Relationships (r)
- **Count:** ${Object.keys(data.r).length} semantic relationships
- **Purpose:** Captures cross-references and conceptual connections

`;
        }
        
        if (data.m) {
            markdown += `### Meta-Structure (m)
- **Complexity:** ${data.m.complexity || 'N/A'}
- **Density:** ${data.m.density || 'N/A'}  
- **Structure:** ${data.m.structure || 'N/A'}
- **Evidence:** ${data.m.evidence || 'N/A'}

`;
        }
        
        markdown += `---

> **Compression Artifact:** This markdown file provides human-readable access to the compressed JSON data, solving visibility asymmetry in markdown readers. The original JSON file is preserved at \`${filename}\`.`;

        return markdown;
    }
    
    createAggregateResultsMarkdown(data, filename, timestamp) {
        const totalDocs = data.length;
        const avgRatio = totalDocs > 0 ? (data.reduce((sum, r) => sum + (r.ratio || 0), 0) / totalDocs).toFixed(2) : 'N/A';
        
        let markdown = `# Aggregate Results: ${filename.replace('.json', '')}

> **Generated:** ${timestamp}  
> **Documents:** ${totalDocs}  
> **Average Ratio:** ${avgRatio}:1

## Results Summary

| Document | Ratio | Strategy | Template |
|----------|-------|----------|----------|
`;

        data.forEach(result => {
            const name = result.filename || result.name || 'Unknown';
            const ratio = result.ratio || 'N/A';
            const strategy = result.strategy || 'N/A';
            const template = result.templateUsed || result.template || 'N/A';
            
            markdown += `| ${name} | ${ratio}:1 | ${strategy} | T${template} |\n`;
        });
        
        markdown += `\n## Raw Data

\`\`\`json
${JSON.stringify(data, null, 2)}
\`\`\`

---

> **Aggregate Data:** This markdown file provides human-readable access to aggregate results data. Original preserved at \`${filename}\`.`;

        return markdown;
    }
    
    createGenericJsonMarkdown(data, filename, timestamp) {
        let markdown = `# JSON Data: ${filename.replace('.json', '')}

> **Generated:** ${timestamp}  
> **Source:** \`${filename}\`

## Data Structure

\`\`\`json
${JSON.stringify(data, null, 2)}
\`\`\`

## Analysis

`;

        // Basic analysis
        if (typeof data === 'object' && data !== null) {
            const keys = Object.keys(data);
            markdown += `- **Object Keys:** ${keys.length} (${keys.join(', ')})
- **Data Type:** Object
`;
            
            // Look for common patterns
            if (data.originalSize && data.compressedSize) {
                const ratio = (data.originalSize / data.compressedSize).toFixed(2);
                markdown += `- **Compression Ratio:** ${ratio}:1
`;
            }
        } else if (Array.isArray(data)) {
            markdown += `- **Array Length:** ${data.length}
- **Data Type:** Array
`;
        } else {
            markdown += `- **Data Type:** ${typeof data}
- **Value:** ${data}
`;
        }

        markdown += `
---

> **Generic JSON Conversion:** This markdown provides human-readable access to JSON data. Original preserved at \`${filename}\`.`;

        return markdown;
    }
    
    convertAll() {
        const files = this.getAllCompressedFiles();
        console.log(`📋 Found ${files.length} JSON files to convert:`);
        files.forEach(file => console.log(`   - ${file}`));
        console.log('');
        
        const results = files.map(file => this.convertFile(file));
        
        const successful = results.filter(r => r.success);
        const failed = results.filter(r => !r.success);
        
        console.log(`\n📊 CONVERSION COMPLETE:`);
        console.log(`✅ Successful: ${successful.length}`);
        console.log(`❌ Failed: ${failed.length}`);
        
        if (failed.length > 0) {
            console.log(`\nFailed conversions:`);
            failed.forEach(f => console.log(`   - ${f.jsonFile}: ${f.error}`));
        }
        
        console.log(`\n📁 All markdown files created in: ${this.markdownDir}`);
        return { successful, failed, total: files.length };
    }
}

// Main execution
if (require.main === module) {
    const converter = new BatchJsonToMarkdownConverter();
    converter.init();
    
    try {
        const results = converter.convertAll();
        console.log(`\n🎉 Batch conversion complete! ${results.successful.length}/${results.total} files converted successfully.`);
    } catch (error) {
        console.error('❌ Batch conversion failed:', error.message);
        process.exit(1);
    }
}

module.exports = BatchJsonToMarkdownConverter;