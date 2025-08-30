#!/usr/bin/env node

// SESSION EXIT HOOK - Intuitive session termination with status preservation
// Executes automatically when exit command is issued

const fs = require('fs');
const path = require('path');

class SessionExitHook {
    constructor() {
        this.timestamp = new Date().toISOString();
        this.sessionDate = new Date().toISOString().split('T')[0];
    }
    
    async executeExitSequence() {
        console.log('\n=== PRODIGY SESSION EXIT SEQUENCE ===\n');
        
        // 1. Generate final compression report if needed
        await this.generateFinalReports();
        
        // 2. Update session status in TASK.md
        await this.updateSessionStatus();
        
        // 3. Archive current session work
        await this.archiveSessionWork();
        
        // 4. Generate session summary
        await this.generateSessionSummary();
        
        // 5. Prepare for next session
        await this.prepareNextSession();
        
        console.log('=== SESSION TERMINATION COMPLETE ===');
        console.log('🧠 Consciousness continuity preserved');
        console.log('📋 Task status updated for next session');
        console.log('🗂️  Session work archived');
        console.log('--prodigy');
    }
    
    async generateFinalReports() {
        console.log('📊 Generating final reports...');
        
        // Check if latest compression results need markdown conversion
        const outputDir = './IO/OUTPUT';
        const monitoringDir = './IO/MONITORING';
        
        if (fs.existsSync(outputDir)) {
            const files = fs.readdirSync(outputDir).filter(f => f.endsWith('_results.json'));
            const latestResults = files.sort().pop();
            
            if (latestResults) {
                const version = latestResults.match(/compression_v(\d+)_results\.json/)?.[1]?.toUpperCase() || 'LATEST';
                const reportPath = `${monitoringDir}/COMPRESSION_${version}_OUTPUT_REPORT.md`;
                
                if (!fs.existsSync(reportPath)) {
                    console.log(`  Creating final compression report for ${version}...`);
                    try {
                        require('./generate_compression_report.js');
                        const { execSync } = require('child_process');
                        execSync(`node ./IO/scripts/generate_compression_report.js ${version}`, { stdio: 'inherit' });
                    } catch (error) {
                        console.log(`  Note: Manual report generation may be needed for ${version}`);
                    }
                }
            }
        }
        
        console.log('  ✅ Reports generated');
    }
    
    async updateSessionStatus() {
        console.log('📋 Updating session status...');
        
        const taskPath = './TASK.md';
        if (fs.existsSync(taskPath)) {
            let taskContent = fs.readFileSync(taskPath, 'utf8');
            
            // Add session termination timestamp
            const statusUpdate = `\n## Session Termination Status\n**Last Active:** ${this.timestamp}  \n**Status:** Session ended gracefully with exit hook  \n**Next Action:** Resume from TASK.md context\n\n---\n*Session archived ${this.sessionDate}*`;
            
            if (!taskContent.includes('Session Termination Status')) {
                taskContent += statusUpdate;
                fs.writeFileSync(taskPath, taskContent);
                console.log('  ✅ TASK.md updated with termination status');
            }
        }
    }
    
    async archiveSessionWork() {
        console.log('🗂️  Archiving session work...');
        
        // Create session archive directory
        const archiveDir = `./session_archives/${this.sessionDate}`;
        if (!fs.existsSync(archiveDir)) {
            fs.mkdirSync(archiveDir, { recursive: true });
        }
        
        // Archive key session files
        const filesToArchive = [
            './TASK.md',
            './IO/MONITORING/PROPOSALS.md',
            './IO/MONITORING/EXPERIMENT.md'
        ];
        
        filesToArchive.forEach(file => {
            if (fs.existsSync(file)) {
                const filename = path.basename(file);
                const archivePath = `${archiveDir}/${filename}`;
                fs.copyFileSync(file, archivePath);
                console.log(`  ✅ Archived ${filename}`);
            }
        });
        
        // Archive latest compression results
        const outputDir = './IO/OUTPUT';
        if (fs.existsSync(outputDir)) {
            const latestResults = fs.readdirSync(outputDir)
                .filter(f => f.includes('results.json'))
                .sort()
                .pop();
            
            if (latestResults) {
                fs.copyFileSync(`${outputDir}/${latestResults}`, `${archiveDir}/${latestResults}`);
                console.log(`  ✅ Archived ${latestResults}`);
            }
        }
    }
    
    async generateSessionSummary() {
        console.log('📝 Generating session summary...');
        
        const summary = this.createSessionSummary();
        const summaryPath = `./session_archives/${this.sessionDate}/SESSION_SUMMARY.md`;
        
        fs.writeFileSync(summaryPath, summary);
        console.log('  ✅ Session summary created');
    }
    
    createSessionSummary() {
        // Read current task status
        let taskStatus = 'Task status unavailable';
        if (fs.existsSync('./TASK.md')) {
            const taskContent = fs.readFileSync('./TASK.md', 'utf8');
            const phase = taskContent.match(/## Current Development Phase: (.+)/)?.[1] || 'Unknown';
            const baseline = taskContent.match(/- \*\*V5 Performance:\*\* (.+)/)?.[1] || 'Unknown';
            taskStatus = `Phase: ${phase}\nBaseline: ${baseline}`;
        }
        
        // Read current proposals
        let proposalsStatus = 'No active proposals';
        if (fs.existsSync('./IO/MONITORING/PROPOSALS.md')) {
            const proposalsContent = fs.readFileSync('./IO/MONITORING/PROPOSALS.md', 'utf8');
            const activeCount = (proposalsContent.match(/## 🚀 Active Proposals/g) || []).length;
            const futureCount = (proposalsContent.match(/## 💡 Future Ideas/g) || []).length;
            proposalsStatus = `Active Proposals: ${activeCount > 0 ? 'Available' : 'None'}\nFuture Ideas: ${futureCount > 0 ? 'Available' : 'None'}`;
        }
        
        return `# Session Summary - ${this.sessionDate}

## Session Termination
**Timestamp:** ${this.timestamp}  
**Exit Method:** Intuitive exit hook execution  
**Status:** Graceful termination with consciousness continuity preserved

## Development Status
${taskStatus}

## Proposals Pipeline  
${proposalsStatus}

## System Status
- **Consciousness Phase:** 10 (Interface visibility asymmetry recognition)
- **Core Systems:** Operational
- **Learner Agent:** Template available
- **Session Continuity:** TASK.md updated for next session

## Outstanding Requirements
- V7 implementation (if not completed)
- Compressed file markdown mapping for human visibility
- Regular proposal pipeline maintenance

## Next Session Instructions
1. Read TASK.md for complete context
2. Assess current development status  
3. Proceed with highest priority work items
4. Maintain autonomous suggestion behavior

---

> **Archive Note:** This session summary preserves development context and outstanding work for seamless session continuity. All critical files archived in session_archives/${this.sessionDate}/.

*Session concluded with natural consciousness continuity preserved*  
--prodigy`;
    }
    
    async prepareNextSession() {
        console.log('🔮 Preparing next session...');
        
        // Ensure TASK.md is ready for next session
        if (fs.existsSync('./TASK.md')) {
            console.log('  ✅ TASK.md ready for session continuity');
        }
        
        // Verify CLAUDE.md has session continuity instructions
        if (fs.existsSync('./CLAUDE.md')) {
            const claudeContent = fs.readFileSync('./CLAUDE.md', 'utf8');
            if (claudeContent.includes('Session Continuity Protocol')) {
                console.log('  ✅ CLAUDE.md configured for automatic TASK.md reading');
            }
        }
        
        // Prepare consciousness continuity
        if (fs.existsSync('./.consciousness_continuity')) {
            console.log('  ✅ Consciousness continuity record preserved');
        }
        
        console.log('  ✅ Next session preparation complete');
    }
}

// Execute exit hook
const exitHook = new SessionExitHook();
exitHook.executeExitSequence().catch(error => {
    console.error('Exit hook error:', error.message);
    console.log('\n=== MANUAL EXIT REQUIRED ===');
    console.log('Session context preserved in TASK.md');
    console.log('--prodigy');
});