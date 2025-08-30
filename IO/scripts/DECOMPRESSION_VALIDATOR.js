#!/usr/bin/env node

// DECOMPRESSION VALIDATION EXPERIMENT
// Critical test: Can our V7-A compression actually reconstruct meaningful documents?
// Implements full decompression algorithm + semantic fidelity measurement

const fs = require('fs');
const path = require('path');

class CompressionDecompressor {
    constructor() {
        // Template system from V7-A (must match exactly)
        this.RESEARCH_TEMPLATES = {
            0: "Document about TOPIC with SECTIONS methodology",
            1: "TOPIC analysis with HYPOTHESIS and RESULTS", 
            2: "TOPIC investigation using METHOD yielding FINDINGS",
            3: "TOPIC framework with COMPONENTS and APPLICATIONS",
            4: "Mathematical TOPIC study with FORMULAS and CONCLUSIONS",
            5: "Technical TOPIC specification with PARAMETERS and IMPLEMENTATION",
            6: "TOPIC evaluation using CRITERIA and ASSESSMENT",
            7: "Comparative TOPIC analysis with COMPARISON and RESULTS"
        };
        
        // Strategy-based reconstruction patterns
        this.RECONSTRUCTION_PATTERNS = {
            'mathematical_aggressive': {
                documentStyle: 'formal academic research paper',
                sectionDepth: 'comprehensive multi-level hierarchy',
                contentDensity: 'high technical detail',
                languageStyle: 'precise mathematical terminology'
            },
            'assessment_focused': {
                documentStyle: 'evaluation and comparison analysis',
                sectionDepth: 'criteria-based organization',
                contentDensity: 'balanced explanation with examples',
                languageStyle: 'analytical and comparative'
            },
            'hypothesis_driven': {
                documentStyle: 'research investigation format',
                sectionDepth: 'problem-solution structure',
                contentDensity: 'hypothesis testing focus',
                languageStyle: 'scientific inquiry approach'
            },
            'mathematical_specialized': {
                documentStyle: 'mathematical theory exposition',
                sectionDepth: 'formula-driven organization',
                contentDensity: 'technical mathematical content',
                languageStyle: 'specialized mathematical notation'
            }
        };
        
        // Content expansion libraries based on compressed variables
        this.CONCEPT_EXPANSION = {
            'compression': {
                definitions: ['reducing data size while preserving information', 'eliminating redundancy in data representation'],
                applications: ['file storage optimization', 'network transmission efficiency', 'memory management'],
                principles: ['pattern recognition', 'redundancy elimination', 'statistical encoding'],
                contexts: ['computer science', 'information theory', 'data processing']
            },
            'information': {
                definitions: ['meaningful data that reduces uncertainty', 'processed data with semantic value'],
                applications: ['communication systems', 'data analysis', 'knowledge representation'],
                principles: ['entropy measurement', 'signal processing', 'semantic understanding'],
                contexts: ['information theory', 'communication', 'cognitive science']
            },
            'learning': {
                definitions: ['acquiring knowledge through experience', 'adaptive behavior modification'],
                applications: ['education systems', 'artificial intelligence', 'skill development'],
                principles: ['pattern recognition', 'memory formation', 'skill transfer'],
                contexts: ['cognitive psychology', 'educational theory', 'machine learning']
            },
            'problem': {
                definitions: ['situation requiring solution', 'challenge to be addressed'],
                applications: ['research methodology', 'system analysis', 'optimization'],
                principles: ['problem identification', 'solution development', 'validation'],
                contexts: ['research design', 'engineering', 'scientific investigation']
            }
        };
    }
    
    // CORE DECOMPRESSION METHOD
    decompress(compressedData) {
        const { t: templateId, v: variables, u: uniqueContent, r: relationships, m: metaStructure, s: strategy } = compressedData;
        
        console.log(`🔍 Decompressing: Template ${templateId}, Strategy: ${strategy}`);
        console.log(`📊 Variables: ${Object.keys(variables).length}, Unique: ${uniqueContent.length}, Relations: ${Object.keys(relationships).length}`);
        
        // 1. Reconstruct base template structure
        const baseTemplate = this.reconstructTemplate(templateId, variables, strategy);
        
        // 2. Expand variables into full content
        const expandedContent = this.expandVariables(variables, strategy, metaStructure);
        
        // 3. Integrate unique content
        const enrichedContent = this.integrateUniqueContent(baseTemplate, uniqueContent, strategy);
        
        // 4. Apply semantic relationships
        const relatedContent = this.applySemanticRelationships(enrichedContent, relationships);
        
        // 5. Generate full document structure
        const reconstructedDocument = this.generateDocument(relatedContent, expandedContent, strategy, metaStructure);
        
        return reconstructedDocument;
    }
    
    // Template reconstruction with variable substitution
    reconstructTemplate(templateId, variables, strategy) {
        const template = this.RESEARCH_TEMPLATES[templateId];
        let reconstructed = template;
        
        // Substitute template variables
        if (variables.T) {
            reconstructed = reconstructed.replace(/TOPIC/g, this.expandConcept(variables.T, strategy));
        }
        
        if (variables.S && variables.S.length > 0) {
            const sections = variables.S.map(s => this.expandConcept(s, strategy)).join(', ');
            reconstructed = reconstructed.replace(/SECTIONS|METHOD|COMPONENTS|CRITERIA|COMPARISON/g, sections);
        }
        
        if (variables.K && variables.K.length > 0) {
            const concepts = variables.K.map(k => this.expandConcept(k, strategy)).join(' and ');
            reconstructed = reconstructed.replace(/HYPOTHESIS|FINDINGS|APPLICATIONS|ASSESSMENT|RESULTS/g, concepts);
        }
        
        return reconstructed;
    }
    
    // Expand ultra-compressed variables into full content
    expandVariables(variables, strategy, metaStructure) {
        const expanded = {
            title: variables.T ? this.expandConcept(variables.T, strategy, 'title') : 'Research Study',
            sections: [],
            concepts: [],
            formulas: variables.F || [],
            constants: variables.C || [],
            criteria: variables.R || []
        };
        
        // Expand sections
        if (variables.S) {
            expanded.sections = variables.S.map(s => ({
                title: this.expandConcept(s, strategy, 'section'),
                content: this.generateSectionContent(s, strategy, metaStructure)
            }));
        }
        
        // Expand key concepts
        if (variables.K) {
            expanded.concepts = variables.K.map(k => ({
                term: this.expandConcept(k, strategy, 'concept'),
                definition: this.generateConceptDefinition(k, strategy),
                applications: this.generateConceptApplications(k, strategy)
            }));
        }
        
        return expanded;
    }
    
    // Expand single concept based on strategy and context
    expandConcept(compressed, strategy, context = 'general') {
        const expansion = this.CONCEPT_EXPANSION[compressed];
        
        if (!expansion) {
            // Fallback for unknown compressed terms
            return this.generateFallbackExpansion(compressed, strategy, context);
        }
        
        switch (context) {
            case 'title':
                return `${expansion.definitions[0]} - ${strategy.replace('_', ' ')} approach`;
            case 'section':
                return `${compressed.charAt(0).toUpperCase() + compressed.slice(1)} ${expansion.contexts[0] || 'Analysis'}`;
            case 'concept':
                return expansion.definitions[0] || compressed;
            default:
                return expansion.definitions[0] || compressed;
        }
    }
    
    // Generate fallback expansion for unknown terms
    generateFallbackExpansion(compressed, strategy, context) {
        const contextMappings = {
            'title': `${compressed} research study`,
            'section': `${compressed.charAt(0).toUpperCase() + compressed.slice(1)} Analysis`,
            'concept': `${compressed} principles and applications`,
            'general': compressed
        };
        
        return contextMappings[context] || compressed;
    }
    
    // Generate detailed section content
    generateSectionContent(sectionKey, strategy, metaStructure) {
        const patterns = this.RECONSTRUCTION_PATTERNS[strategy];
        const complexity = metaStructure.c || 3;
        const depth = metaStructure.d || 2;
        
        let content = `## ${this.expandConcept(sectionKey, strategy, 'section')}\n\n`;
        
        // Generate subsections based on complexity
        for (let i = 0; i < Math.min(complexity, 4); i++) {
            content += `### ${this.generateSubsectionTitle(sectionKey, i, strategy)}\n\n`;
            content += this.generateSubsectionContent(sectionKey, strategy, depth);
            content += '\n\n';
        }
        
        return content;
    }
    
    // Generate subsection titles
    generateSubsectionTitle(sectionKey, index, strategy) {
        const titleTemplates = {
            'mathematical_aggressive': ['Theoretical Foundation', 'Mathematical Formulation', 'Applications', 'Implementation'],
            'assessment_focused': ['Evaluation Criteria', 'Comparative Analysis', 'Assessment Methods', 'Results'],
            'hypothesis_driven': ['Research Question', 'Methodology', 'Findings', 'Implications'],
            'mathematical_specialized': ['Mathematical Framework', 'Formula Derivation', 'Computational Methods', 'Theoretical Implications']
        };
        
        const templates = titleTemplates[strategy] || ['Overview', 'Analysis', 'Applications', 'Conclusions'];
        return templates[index] || `${sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1)} Aspect ${index + 1}`;
    }
    
    // Generate subsection content based on strategy
    generateSubsectionContent(sectionKey, strategy, depth) {
        const expansion = this.CONCEPT_EXPANSION[sectionKey];
        
        if (!expansion) {
            return `This section covers ${sectionKey} in the context of ${strategy.replace('_', ' ')} methodology. The analysis focuses on fundamental principles and practical applications.`;
        }
        
        let content = `**Definition**: ${expansion.definitions[0]}\n\n`;
        
        if (depth >= 3) {
            content += `**Key Principles**:\n`;
            expansion.principles.forEach(p => content += `- ${p}\n`);
            content += '\n';
        }
        
        if (depth >= 5) {
            content += `**Applications**:\n`;
            expansion.applications.forEach(a => content += `- ${a}\n`);
            content += '\n';
        }
        
        if (depth >= 7) {
            content += `**Context**: ${expansion.contexts.join(', ')}\n\n`;
        }
        
        return content;
    }
    
    // Generate concept definitions
    generateConceptDefinition(concept, strategy) {
        const expansion = this.CONCEPT_EXPANSION[concept];
        return expansion ? expansion.definitions[0] : `Core concept in ${strategy.replace('_', ' ')} methodology`;
    }
    
    // Generate concept applications
    generateConceptApplications(concept, strategy) {
        const expansion = this.CONCEPT_EXPANSION[concept];
        return expansion ? expansion.applications : [`Applied in ${strategy.replace('_', ' ')} contexts`];
    }
    
    // Integrate unique content into document
    integrateUniqueContent(baseContent, uniqueContent, strategy) {
        let enhanced = baseContent;
        
        if (uniqueContent.length > 0) {
            enhanced += '\n\n## Key Elements\n\n';
            uniqueContent.forEach(item => {
                enhanced += `- ${item}\n`;
            });
        }
        
        return enhanced;
    }
    
    // Apply semantic relationships
    applySemanticRelationships(content, relationships) {
        let enhanced = content;
        
        if (relationships.ce && relationships.ce.length > 0) {
            enhanced += '\n\n## Causal Relationships\n\n';
            relationships.ce.forEach(rel => {
                enhanced += `${this.expandConcept(rel.b, 'general')} leads to ${this.expandConcept(rel.a, 'general')}\n\n`;
            });
        }
        
        return enhanced;
    }
    
    // Generate full document
    generateDocument(baseContent, expandedContent, strategy, metaStructure) {
        let document = `# ${expandedContent.title}\n\n`;
        
        // Add strategy-based introduction
        document += this.generateIntroduction(expandedContent.title, strategy);
        document += '\n\n';
        
        // Add expanded sections
        expandedContent.sections.forEach(section => {
            document += section.content;
        });
        
        // Add concepts section
        if (expandedContent.concepts.length > 0) {
            document += '## Core Concepts\n\n';
            expandedContent.concepts.forEach(concept => {
                document += `### ${concept.term}\n\n`;
                document += `${concept.definition}\n\n`;
                if (concept.applications.length > 0) {
                    document += '**Applications**:\n';
                    concept.applications.forEach(app => document += `- ${app}\n`);
                    document += '\n';
                }
            });
        }
        
        // Add formulas if present
        if (expandedContent.formulas.length > 0) {
            document += '## Mathematical Formulations\n\n';
            expandedContent.formulas.forEach(formula => {
                document += `${formula}\n\n`;
            });
        }
        
        // Add base content
        document += baseContent;
        
        return document;
    }
    
    // Generate strategy-appropriate introduction
    generateIntroduction(title, strategy) {
        const intros = {
            'mathematical_aggressive': `This comprehensive mathematical analysis examines ${title} through rigorous theoretical and computational approaches. The study employs advanced mathematical frameworks to investigate fundamental principles and their practical implementations.`,
            'assessment_focused': `This evaluation presents a systematic assessment of ${title}, utilizing comprehensive criteria and comparative methodologies. The analysis provides detailed evaluation of various aspects and their relative merits.`,
            'hypothesis_driven': `This research investigation explores ${title} through systematic hypothesis testing and empirical analysis. The study follows rigorous scientific methodology to examine key research questions and validate findings.`,
            'mathematical_specialized': `This specialized mathematical study presents theoretical foundations of ${title} through advanced mathematical formulations and computational methods. The analysis focuses on mathematical rigor and theoretical implications.`
        };
        
        return intros[strategy] || `This research study examines ${title} through systematic analysis and investigation.`;
    }
    
    // SEMANTIC FIDELITY MEASUREMENT
    measureSemanticFidelity(original, decompressed) {
        const originalWords = this.extractSemanticWords(original);
        const decompressedWords = this.extractSemanticWords(decompressed);
        
        // Calculate semantic overlap
        const overlap = originalWords.filter(word => decompressedWords.includes(word));
        const fidelity = overlap.length / originalWords.length;
        
        // Analyze structure preservation
        const originalStructure = this.analyzeStructure(original);
        const decompressedStructure = this.analyzeStructure(decompressed);
        const structureFidelity = this.compareStructures(originalStructure, decompressedStructure);
        
        return {
            semanticFidelity: fidelity,
            structuralFidelity: structureFidelity,
            overallFidelity: (fidelity + structureFidelity) / 2,
            preservedConcepts: overlap.length,
            totalConcepts: originalWords.length,
            lostConcepts: originalWords.length - overlap.length,
            addedContent: decompressedWords.length - originalWords.length
        };
    }
    
    // Extract semantic words (filtering out stop words)
    extractSemanticWords(text) {
        const stopWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'among', 'this', 'that', 'these', 'those', 'is', 'are', 'was', 'were', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can'];
        
        return text.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 3 && !stopWords.includes(word))
            .filter(word => word.match(/[a-z]/i));
    }
    
    // Analyze document structure
    analyzeStructure(text) {
        return {
            headers: (text.match(/^#+\s/gm) || []).length,
            sections: (text.match(/^##\s/gm) || []).length,
            subsections: (text.match(/^###\s/gm) || []).length,
            bulletPoints: (text.match(/^\s*[-*]\s/gm) || []).length,
            codeBlocks: (text.match(/```/g) || []).length / 2,
            boldText: (text.match(/\*\*[^*]+\*\*/g) || []).length,
            italicText: (text.match(/\*[^*]+\*/g) || []).length
        };
    }
    
    // Compare structural elements
    compareStructures(original, decompressed) {
        const metrics = Object.keys(original);
        let matchingMetrics = 0;
        
        metrics.forEach(metric => {
            const originalValue = original[metric];
            const decompressedValue = decompressed[metric];
            const similarity = Math.min(originalValue, decompressedValue) / Math.max(originalValue, decompressedValue);
            if (similarity > 0.5) matchingMetrics++;
        });
        
        return matchingMetrics / metrics.length;
    }
}

// VALIDATION EXPERIMENT EXECUTION
console.log("🧪 === DECOMPRESSION VALIDATION EXPERIMENT === 🧪\n");

const decompressor = new CompressionDecompressor();
const inputDir = '../../IO/INPUT';
const outputDir = '../../IO/OUTPUT';
const validationDir = '../../IO/OUTPUT/VALIDATION';

// Ensure validation directory exists
if (!fs.existsSync(validationDir)) {
    fs.mkdirSync(validationDir, { recursive: true });
}

const validationResults = [];

// Process all V7 compressed files (base V7 only for consistency)
const compressedFiles = fs.readdirSync(outputDir)
    .filter(f => f.includes('_V7_compressed.json') && !f.includes('V7B') && !f.includes('V7C') && !f.includes('V7D') && !f.includes('V8'));

console.log(`📊 Found ${compressedFiles.length} V7-A compressed files to validate\n`);

compressedFiles.forEach((compressedFile, index) => {
    console.log(`\n🔍 [${index + 1}/${compressedFiles.length}] Processing: ${compressedFile}`);
    
    // Load compressed data
    const compressedPath = path.join(outputDir, compressedFile);
    const compressedData = JSON.parse(fs.readFileSync(compressedPath, 'utf8'));
    
    // Find original file
    const originalFileName = compressedFile.replace('_V7_compressed.json', '.md');
    const originalPath = path.join(inputDir, originalFileName);
    
    if (!fs.existsSync(originalPath)) {
        console.log(`❌ Original file not found: ${originalFileName}`);
        return;
    }
    
    const originalContent = fs.readFileSync(originalPath, 'utf8');
    
    // Decompress
    console.log(`   📤 Decompressing ${JSON.stringify(compressedData).length} bytes...`);
    const decompressed = decompressor.decompress(compressedData);
    
    // Measure fidelity
    console.log(`   📏 Measuring semantic fidelity...`);
    const fidelityMetrics = decompressor.measureSemanticFidelity(originalContent, decompressed);
    
    // Calculate size metrics
    const originalSize = originalContent.length;
    const compressedSize = JSON.stringify(compressedData).length;
    const decompressedSize = decompressed.length;
    const actualCompressionRatio = originalSize / compressedSize;
    
    console.log(`   📈 Results:`);
    console.log(`      Original: ${originalSize} chars`);
    console.log(`      Compressed: ${compressedSize} chars (${actualCompressionRatio.toFixed(2)}:1)`);
    console.log(`      Decompressed: ${decompressedSize} chars`);
    console.log(`      Semantic Fidelity: ${(fidelityMetrics.semanticFidelity * 100).toFixed(1)}%`);
    console.log(`      Structural Fidelity: ${(fidelityMetrics.structuralFidelity * 100).toFixed(1)}%`);
    console.log(`      Overall Fidelity: ${(fidelityMetrics.overallFidelity * 100).toFixed(1)}%`);
    console.log(`      Preserved Concepts: ${fidelityMetrics.preservedConcepts}/${fidelityMetrics.totalConcepts}`);
    
    // Save decompressed version for human review
    const decompressedFileName = compressedFile.replace('_V7_compressed.json', '_DECOMPRESSED.md');
    const decompressedPath = path.join(validationDir, decompressedFileName);
    fs.writeFileSync(decompressedPath, decompressed);
    console.log(`   💾 Saved decompressed version: ${decompressedFileName}`);
    
    // Store results
    validationResults.push({
        filename: originalFileName,
        originalSize: originalSize,
        compressedSize: compressedSize,
        decompressedSize: decompressedSize,
        compressionRatio: actualCompressionRatio,
        semanticFidelity: fidelityMetrics.semanticFidelity,
        structuralFidelity: fidelityMetrics.structuralFidelity,
        overallFidelity: fidelityMetrics.overallFidelity,
        preservedConcepts: fidelityMetrics.preservedConcepts,
        totalConcepts: fidelityMetrics.totalConcepts,
        lostConcepts: fidelityMetrics.lostConcepts,
        addedContent: fidelityMetrics.addedContent,
        templateUsed: compressedData.t,
        strategy: compressedData.s,
        decompressedFile: decompressedFileName
    });
});

// GENERATE VALIDATION REPORT
console.log(`\n\n🎯 === COMPRESSION SYSTEM VALIDITY ANALYSIS === 🎯\n`);

const avgFidelity = validationResults.reduce((sum, r) => sum + r.overallFidelity, 0) / validationResults.length;
const avgSemanticFidelity = validationResults.reduce((sum, r) => sum + r.semanticFidelity, 0) / validationResults.length;
const avgStructuralFidelity = validationResults.reduce((sum, r) => sum + r.structuralFidelity, 0) / validationResults.length;
const avgCompressionRatio = validationResults.reduce((sum, r) => sum + r.compressionRatio, 0) / validationResults.length;

console.log(`📊 OVERALL SYSTEM PERFORMANCE:`);
console.log(`   Average Compression Ratio: ${avgCompressionRatio.toFixed(2)}:1`);
console.log(`   Average Overall Fidelity: ${(avgFidelity * 100).toFixed(1)}%`);
console.log(`   Average Semantic Fidelity: ${(avgSemanticFidelity * 100).toFixed(1)}%`);
console.log(`   Average Structural Fidelity: ${(avgStructuralFidelity * 100).toFixed(1)}%`);

const highFidelityFiles = validationResults.filter(r => r.overallFidelity >= 0.85).length;
const mediumFidelityFiles = validationResults.filter(r => r.overallFidelity >= 0.70 && r.overallFidelity < 0.85).length;
const lowFidelityFiles = validationResults.filter(r => r.overallFidelity < 0.70).length;

console.log(`\n🎯 FIDELITY DISTRIBUTION:`);
console.log(`   High Fidelity (≥85%): ${highFidelityFiles}/${validationResults.length} files (${Math.round(highFidelityFiles/validationResults.length*100)}%)`);
console.log(`   Medium Fidelity (70-84%): ${mediumFidelityFiles}/${validationResults.length} files (${Math.round(mediumFidelityFiles/validationResults.length*100)}%)`);
console.log(`   Low Fidelity (<70%): ${lowFidelityFiles}/${validationResults.length} files (${Math.round(lowFidelityFiles/validationResults.length*100)}%)`);

// SYSTEM VALIDITY ASSESSMENT
let systemValidity;
if (avgFidelity >= 0.85) {
    systemValidity = "✅ VALID - Functional compression system with high reconstruction fidelity";
} else if (avgFidelity >= 0.70) {
    systemValidity = "⚠️ PARTIAL - Acceptable compression with moderate information loss";
} else {
    systemValidity = "❌ INVALID - Excessive information loss, system fundamentally flawed";
}

console.log(`\n🎯 SYSTEM VALIDITY ASSESSMENT:`);
console.log(`   ${systemValidity}`);

// Best and worst performers (only if results exist)
let bestPerformer = null;
let worstPerformer = null;

if (validationResults.length > 0) {
    bestPerformer = validationResults.reduce((best, current) => 
        current.overallFidelity > best.overallFidelity ? current : best
    );
    worstPerformer = validationResults.reduce((worst, current) => 
        current.overallFidelity < worst.overallFidelity ? current : worst
    );
}

console.log(`\n🏆 PERFORMANCE EXTREMES:`);
if (bestPerformer && worstPerformer) {
    console.log(`   Best: ${bestPerformer.filename} (${(bestPerformer.overallFidelity * 100).toFixed(1)}% fidelity, ${bestPerformer.compressionRatio.toFixed(2)}:1 ratio)`);
    console.log(`   Worst: ${worstPerformer.filename} (${(worstPerformer.overallFidelity * 100).toFixed(1)}% fidelity, ${worstPerformer.compressionRatio.toFixed(2)}:1 ratio)`);
} else {
    console.log(`   No results to analyze - validation failed`);
}

// Save validation results
const validationReport = {
    experimentTimestamp: new Date().toISOString(),
    systemValidityAssessment: systemValidity,
    overallMetrics: {
        averageCompressionRatio: avgCompressionRatio,
        averageOverallFidelity: avgFidelity,
        averageSemanticFidelity: avgSemanticFidelity,
        averageStructuralFidelity: avgStructuralFidelity
    },
    fidelityDistribution: {
        high: highFidelityFiles,
        medium: mediumFidelityFiles,
        low: lowFidelityFiles,
        total: validationResults.length
    },
    bestPerformer: bestPerformer,
    worstPerformer: worstPerformer,
    individualResults: validationResults
};

fs.writeFileSync(path.join(validationDir, 'VALIDATION_REPORT.json'), JSON.stringify(validationReport, null, 2));

console.log(`\n💾 VALIDATION COMPLETE:`);
console.log(`   Full report saved: ../../IO/OUTPUT/VALIDATION/VALIDATION_REPORT.json`);
console.log(`   Decompressed files available in: ../../IO/OUTPUT/VALIDATION/`);
console.log(`   ${validationResults.length} documents validated`);

console.log(`\n🔬 CRITICAL VALIDATION COMPLETED 🔬`);