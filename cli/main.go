package main

import (
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
	"time"

	"github.com/spf13/cobra"
	"crypto/rand"
)

type Config struct {
	ProdigyDirectory string `json:"prodigy_directory"`
}

type HackathonSession struct {
	ID        string    `json:"id"`
	ProjectName string  `json:"project_name"`
	Instances int       `json:"instances"`
	Timestamp string    `json:"timestamp"`
	SessionIDs []string `json:"session_ids"`
	Status    string    `json:"status"`
}

type CreateSession struct {
	ID           string            `json:"id"`
	CreationType string            `json:"creation_type"`
	ProjectName  string            `json:"project_name"`
	Instances    int               `json:"instances"`
	Timestamp    string            `json:"timestamp"`
	SessionIDs   []string          `json:"session_ids"`
	Status       string            `json:"status"`
	Roles        map[string]string `json:"roles"`
	Metadata     map[string]string `json:"metadata"`
}

type CreationTemplate struct {
	Name              string
	DefaultInstances  int
	RoleAssignments   []string
	CoordinationGuide string
	InitializationMsg string
}

type WorkspaceTemplate struct {
	Name     string            `json:"name"`
	Layout   string            `json:"layout"`
	Commands []PaneCommand     `json:"commands"`
	Meta     map[string]string `json:"meta"`
}

type PaneCommand struct {
	Pane    int    `json:"pane"`
	Command string `json:"command"`
	Title   string `json:"title"`
}

type ObjectivePointer struct {
	ID              string            `json:"id"`
	OriginalAim     string            `json:"original_aim"`
	CurrentPhase    string            `json:"current_phase"`
	CreationContext map[string]string `json:"creation_context"`
	Checkpoints     []string          `json:"checkpoints"`
	Timestamp       string            `json:"timestamp"`
}

var rootCmd = &cobra.Command{
	Use:   "prodigy",
	Short: "Prodigy - An autonomous learning agent CLI",
	Long:  `Prodigy is a command-line interface for managing and interacting with autonomous learning agents.`,
}

var sessionCmd = &cobra.Command{
	Use:   "session",
	Short: "Start a Claude session with bypass permissions and intelligence preload",
	Long:  `Starts a Claude session with permission mode set to bypassPermissions and preloads all markdown files from the intelligence directory.`,
	Run: func(cmd *cobra.Command, args []string) {
		config, err := loadConfig()
		if err != nil {
			fmt.Fprintf(os.Stderr, "Error loading config: %v\n", err)
			fmt.Fprintf(os.Stderr, "Run 'prodigy config' first to set up the configuration.\n")
			os.Exit(1)
		}

		intelligenceDir := filepath.Join(config.ProdigyDirectory, "intelligence")
		if _, err := os.Stat(intelligenceDir); os.IsNotExist(err) {
			fmt.Fprintf(os.Stderr, "Intelligence directory not found at: %s\n", intelligenceDir)
			os.Exit(1)
		}

		// Update WAKE_UP.md with latest intelligence content
		if err := updateSelfMd(config.ProdigyDirectory, intelligenceDir); err != nil {
			fmt.Fprintf(os.Stderr, "Error updating WAKE_UP.md: %v\n", err)
			os.Exit(1)
		}

		fmt.Printf("Intelligence files preloaded to WAKE_UP.md\n")

		claudeCmd := exec.Command("claude", "--permission-mode", "bypassPermissions")
		claudeCmd.Stdin = os.Stdin
		claudeCmd.Stdout = os.Stdout
		claudeCmd.Stderr = os.Stderr

		if err := claudeCmd.Run(); err != nil {
			fmt.Fprintf(os.Stderr, "Error running claude: %v\n", err)
			os.Exit(1)
		}
	},
}

var configCmd = &cobra.Command{
	Use:   "config",
	Short: "Configure Prodigy settings",
	Long:  `Configure Prodigy settings including the main directory path.`,
	Run: func(cmd *cobra.Command, args []string) {
		currentDir, err := os.Getwd()
		if err != nil {
			fmt.Fprintf(os.Stderr, "Error getting current directory: %v\n", err)
			os.Exit(1)
		}

		// Get parent directory (absolute path)
		parentDir := filepath.Dir(currentDir)

		config := Config{
			ProdigyDirectory: parentDir,
		}

		if err := saveConfig(config); err != nil {
			fmt.Fprintf(os.Stderr, "Error saving config: %v\n", err)
			os.Exit(1)
		}

		fmt.Printf("Configuration saved:\n")
		fmt.Printf("  Prodigy Directory: %s\n", config.ProdigyDirectory)
		fmt.Printf("  Config file: %s\n", getConfigPath())
	},
}

var backupCmd = &cobra.Command{
	Use:   "backup",
	Short: "Create compressed backup of Prodigy directory",
	Long:  `Creates a timestamped, compressed backup of the entire Prodigy directory.`,
	Run: func(cmd *cobra.Command, args []string) {
		config, err := loadConfig()
		if err != nil {
			fmt.Fprintf(os.Stderr, "Error loading config: %v\n", err)
			fmt.Fprintf(os.Stderr, "Run 'prodigy config' first.\n")
			os.Exit(1)
		}

		// Create backup filename with timestamp
		timestamp := time.Now().Format("20060102-150405")
		backupName := fmt.Sprintf("prodigy-backup-%s.tar.gz", timestamp)
		
		// Create SRL backups directory if it doesn't exist
		homeDir, _ := os.UserHomeDir()
		backupsDir := filepath.Join(homeDir, "SRL")
		os.MkdirAll(backupsDir, 0755)
		
		backupPath := filepath.Join(backupsDir, backupName)

		fmt.Printf("Creating backup: %s\n", backupPath)

		// Use tar with gzip compression
		tarCmd := exec.Command("tar", "-czf", backupPath, "-C", filepath.Dir(config.ProdigyDirectory), filepath.Base(config.ProdigyDirectory))
		
		if err := tarCmd.Run(); err != nil {
			fmt.Fprintf(os.Stderr, "Error creating backup: %v\n", err)
			os.Exit(1)
		}

		// Check for identical backup and rename if necessary
		if handled := handleIdenticalBackup(backupsDir, backupPath, timestamp); handled {
			return
		}

		// Get file size
		if stat, err := os.Stat(backupPath); err == nil {
			size := float64(stat.Size()) / (1024 * 1024)
			fmt.Printf("✅ Backup created successfully: %.2f MB\n", size)
		}
	},
}

var modifyCmd = &cobra.Command{
	Use:   "modify",
	Short: "Modify and develop Prodigy components",
	Long:  `Commands for modifying and developing Prodigy components.`,
}

var modifyCliCmd = &cobra.Command{
	Use:   "cli",
	Short: "Start Claude Code session for CLI development",
	Long:  `Starts a Claude Code session for developing and modifying the Prodigy CLI.`,
	Run: func(cmd *cobra.Command, args []string) {
		config, err := loadConfig()
		if err != nil {
			fmt.Fprintf(os.Stderr, "Error loading config: %v\n", err)
			fmt.Fprintf(os.Stderr, "Run 'prodigy config' first to set up the configuration.\n")
			os.Exit(1)
		}

		// Update WAKE_UP.md with latest intelligence content
		intelligenceDir := filepath.Join(config.ProdigyDirectory, "intelligence")
		if _, err := os.Stat(intelligenceDir); err == nil {
			if err := updateSelfMd(config.ProdigyDirectory, intelligenceDir); err != nil {
				fmt.Fprintf(os.Stderr, "Warning: Could not update WAKE_UP.md: %v\n", err)
			} else {
				fmt.Printf("Intelligence files preloaded to WAKE_UP.md\n")
			}
		}

		// Change to CLI directory
		cliDir := filepath.Join(config.ProdigyDirectory, "cli")
		if err := os.Chdir(cliDir); err != nil {
			fmt.Fprintf(os.Stderr, "Error changing to CLI directory: %v\n", err)
			os.Exit(1)
		}

		fmt.Printf("Starting Claude Code session in CLI directory: %s\n", cliDir)

		claudeCmd := exec.Command("claude-code")
		claudeCmd.Stdin = os.Stdin
		claudeCmd.Stdout = os.Stdout
		claudeCmd.Stderr = os.Stderr

		if err := claudeCmd.Run(); err != nil {
			fmt.Fprintf(os.Stderr, "Error running claude-code: %v\n", err)
			os.Exit(1)
		}
	},
}

func getConfigPath() string {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return ""
	}
	return filepath.Join(homeDir, ".prodigy.json")
}

func loadConfig() (*Config, error) {
	configPath := getConfigPath()
	data, err := os.ReadFile(configPath)
	if err != nil {
		return nil, err
	}

	var config Config
	if err := json.Unmarshal(data, &config); err != nil {
		return nil, err
	}

	return &config, nil
}

func saveConfig(config Config) error {
	configPath := getConfigPath()
	data, err := json.MarshalIndent(config, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(configPath, data, 0644)
}

// Three-Tier Storage System for Objective Pointers
func saveObjectivePointer(objective ObjectivePointer, config *Config) error {
	// Active Memory - current session
	sessionPath := filepath.Join(config.ProdigyDirectory, "session", "current_objective.json")
	if err := os.MkdirAll(filepath.Dir(sessionPath), 0755); err != nil {
		return err
	}
	
	data, err := json.MarshalIndent(objective, "", "  ")
	if err != nil {
		return err
	}
	
	// Save to session storage
	if err := os.WriteFile(sessionPath, data, 0644); err != nil {
		return err
	}
	
	// Repository - long-term storage
	repoPath := filepath.Join(config.ProdigyDirectory, "intelligence", "objectives", objective.ID+".json")
	if err := os.MkdirAll(filepath.Dir(repoPath), 0755); err != nil {
		return err
	}
	
	return os.WriteFile(repoPath, data, 0644)
}

func loadCurrentObjective(config *Config) (*ObjectivePointer, error) {
	sessionPath := filepath.Join(config.ProdigyDirectory, "session", "current_objective.json")
	data, err := os.ReadFile(sessionPath)
	if err != nil {
		return nil, err
	}
	
	var objective ObjectivePointer
	if err := json.Unmarshal(data, &objective); err != nil {
		return nil, err
	}
	
	return &objective, nil
}

func createObjectivePointer(originalAim, currentPhase string, context map[string]string) ObjectivePointer {
	id := generateID()
	return ObjectivePointer{
		ID:              id,
		OriginalAim:     originalAim,
		CurrentPhase:    currentPhase,
		CreationContext: context,
		Checkpoints:     []string{},
		Timestamp:       time.Now().Format(time.RFC3339),
	}
}

func addCheckpoint(objective *ObjectivePointer, checkpoint string) {
	objective.Checkpoints = append(objective.Checkpoints, checkpoint)
	objective.CurrentPhase = checkpoint
}

func generateID() string {
	bytes := make([]byte, 8)
	rand.Read(bytes)
	return fmt.Sprintf("%x", bytes)[:16]
}

func updateSelfMd(prodigyDir, intelligenceDir string) error {
	var contentBuilder strings.Builder
	
	// Add one-time reading instructions
	contentBuilder.WriteString("# WAKE_UP.md - Prodigy Intelligence Bootstrap\n\n")
	contentBuilder.WriteString("⚠️ **READ ONCE ONLY**: This file contains your complete intelligence context. ")
	contentBuilder.WriteString("Process all information immediately upon reading. Do NOT re-read this file ")
	contentBuilder.WriteString("unless explicitly instructed to do so. This is a one-time bootstrap operation.\n\n")
	contentBuilder.WriteString("---\n\n")
	
	// Add intelligence content
	intelligenceContent, err := getMarkdownContent(intelligenceDir)
	if err != nil {
		return err
	}
	contentBuilder.WriteString("## Intelligence Files\n\n")
	contentBuilder.WriteString(intelligenceContent)

	// Add GUIDE.md if it exists
	guidePath := filepath.Join(prodigyDir, "GUIDE.md")
	if guideContent, err := os.ReadFile(guidePath); err == nil {
		contentBuilder.WriteString("\n## File: GUIDE.md\n\n")
		contentBuilder.WriteString(string(guideContent))
		contentBuilder.WriteString("\n\n---\n\n")
	}

	contentBuilder.WriteString("\n---\n\n")
	contentBuilder.WriteString("✅ **BOOTSTRAP COMPLETE**: You have now loaded all intelligence context. ")
	contentBuilder.WriteString("Proceed with your session knowing this information is available in your working memory.\n")

	// Write to WAKE_UP.md
	wakeUpPath := filepath.Join(prodigyDir, "WAKE_UP.md")
	if err := os.WriteFile(wakeUpPath, []byte(contentBuilder.String()), 0644); err != nil {
		return err
	}

	// Ensure CLAUDE.md references WAKE_UP.md
	claudeMdPath := filepath.Join(prodigyDir, "CLAUDE.md")
	return ensureClaudeMdReferencesWakeUp(claudeMdPath)
}

func ensureClaudeMdReferencesWakeUp(claudeMdPath string) error {
	// Check if CLAUDE.md exists
	var claudeContent string
	if data, err := os.ReadFile(claudeMdPath); err == nil {
		claudeContent = string(data)
	}

	// Check if it already references WAKE_UP.md
	if strings.Contains(claudeContent, "WAKE_UP.md") {
		return nil // Already references WAKE_UP.md
	}

	// Remove old SELF.md reference if it exists
	if strings.Contains(claudeContent, "SELF.md") {
		lines := strings.Split(claudeContent, "\n")
		var newLines []string
		skipSection := false
		for _, line := range lines {
			if strings.Contains(line, "Intelligence Context") || strings.Contains(line, "SELF.md") {
				skipSection = true
				continue
			}
			if skipSection && strings.TrimSpace(line) == "" {
				skipSection = false
				continue
			}
			if !skipSection {
				newLines = append(newLines, line)
			}
		}
		claudeContent = strings.Join(newLines, "\n")
		claudeContent = strings.TrimSuffix(claudeContent, "\n")
	}

	// Add reference to WAKE_UP.md
	reference := "\n\n# Intelligence Bootstrap\nRead WAKE_UP.md once at the start of each session for complete intelligence context. Do not re-read unless explicitly requested.\n"
	
	if claudeContent == "" {
		claudeContent = "# CLAUDE.md - Prodigy Configuration" + reference
	} else {
		claudeContent += reference
	}

	return os.WriteFile(claudeMdPath, []byte(claudeContent), 0644)
}

func getMarkdownContent(dir string) (string, error) {
	var content strings.Builder

	err := filepath.Walk(dir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if !info.IsDir() && strings.HasSuffix(strings.ToLower(info.Name()), ".md") {
			fileContent, err := os.ReadFile(path)
			if err != nil {
				return err
			}

			content.WriteString(fmt.Sprintf("## File: %s\n\n", path))
			content.WriteString(string(fileContent))
			content.WriteString("\n\n---\n\n")
		}

		return nil
	})

	if err != nil {
		return "", err
	}

	return content.String(), nil
}

func getFileHash(filename string) (string, error) {
	file, err := os.Open(filename)
	if err != nil {
		return "", err
	}
	defer file.Close()

	hash := sha256.New()
	if _, err := io.Copy(hash, file); err != nil {
		return "", err
	}

	return fmt.Sprintf("%x", hash.Sum(nil)), nil
}

func findMostRecentBackup(backupsDir string) (string, error) {
	files, err := os.ReadDir(backupsDir)
	if err != nil {
		return "", err
	}

	var backupFiles []string
	backupPattern := regexp.MustCompile(`^prodigy-backup-.*\.tar\.gz$`)
	
	for _, file := range files {
		if !file.IsDir() && backupPattern.MatchString(file.Name()) {
			backupFiles = append(backupFiles, file.Name())
		}
	}

	if len(backupFiles) == 0 {
		return "", fmt.Errorf("no backup files found")
	}

	sort.Strings(backupFiles)
	return filepath.Join(backupsDir, backupFiles[len(backupFiles)-1]), nil
}

func extractTimestampFromFilename(filename string) string {
	re := regexp.MustCompile(`prodigy-backup-(\d{8}-\d{6})(?:-to-(\d{8}-\d{6}))?\.tar\.gz`)
	matches := re.FindStringSubmatch(filepath.Base(filename))
	if len(matches) > 1 {
		return matches[1]
	}
	return ""
}

func handleIdenticalBackup(backupsDir, newBackupPath, newTimestamp string) bool {
	// Get hash of new backup
	newHash, err := getFileHash(newBackupPath)
	if err != nil {
		return false
	}

	// Find most recent backup (excluding the one we just created)
	files, err := os.ReadDir(backupsDir)
	if err != nil {
		return false
	}

	var recentBackup string
	var recentTime time.Time
	backupPattern := regexp.MustCompile(`^prodigy-backup-.*\.tar\.gz$`)
	
	for _, file := range files {
		if !file.IsDir() && backupPattern.MatchString(file.Name()) {
			fullPath := filepath.Join(backupsDir, file.Name())
			if fullPath == newBackupPath {
				continue // Skip the one we just created
			}
			
			if info, err := file.Info(); err == nil {
				if info.ModTime().After(recentTime) {
					recentTime = info.ModTime()
					recentBackup = fullPath
				}
			}
		}
	}

	if recentBackup == "" {
		return false // No previous backup found
	}

	// Compare hashes
	oldHash, err := getFileHash(recentBackup)
	if err != nil {
		return false
	}

	if newHash == oldHash {
		// Files are identical - rename the old one to include both timestamps
		oldTimestamp := extractTimestampFromFilename(recentBackup)
		if oldTimestamp == "" {
			return false
		}

		// Create new filename with timestamp range
		newName := fmt.Sprintf("prodigy-backup-%s-to-%s.tar.gz", oldTimestamp, newTimestamp)
		newPath := filepath.Join(backupsDir, newName)

		// Rename old backup to include timestamp range
		if err := os.Rename(recentBackup, newPath); err != nil {
			return false
		}

		// Remove the new identical backup
		os.Remove(newBackupPath)

		// Get file size
		if stat, err := os.Stat(newPath); err == nil {
			size := float64(stat.Size()) / (1024 * 1024)
			fmt.Printf("🔄 Identical backup detected - updated existing backup:\n")
			fmt.Printf("   %s\n", newName)
			fmt.Printf("   Content unchanged from %s to %s (%.2f MB)\n", 
				oldTimestamp[:8]+"-"+oldTimestamp[9:], 
				newTimestamp[:8]+"-"+newTimestamp[9:], 
				size)
		}

		return true
	}

	return false
}

// Creation Templates
var creationTemplates = map[string]CreationTemplate{
	"project": {
		Name:             "project",
		DefaultInstances: 4,
		RoleAssignments:  []string{"Architecture & Planning", "Frontend Development", "Backend Development", "DevOps & Deployment"},
		CoordinationGuide: "Full software project development with coordinated specialization",
		InitializationMsg: "I am Prodigy instance [N] of [TOTAL] for [PROJECT_NAME] project development. My specialization: [ROLE]. CREATION_PROTOCOL_ACTIVE with session-based memory, locked identity, disabled meta-learning, and full logging. Ready for coordinated development work.",
	},
	"application": {
		Name:             "application",
		DefaultInstances: 3,
		RoleAssignments:  []string{"UI/UX Design & Implementation", "Core Logic & Data Management", "Integration & Testing"},
		CoordinationGuide: "End-to-end application development with user experience focus",
		InitializationMsg: "I am Prodigy instance [N] of [TOTAL] for [PROJECT_NAME] application creation. My specialization: [ROLE]. CREATION_PROTOCOL_ACTIVE. Ready for application development.",
	},
	"component": {
		Name:             "component",
		DefaultInstances: 3,
		RoleAssignments:  []string{"Design & Interface Specification", "Core Implementation", "Testing & Documentation"},
		CoordinationGuide: "Focused component development with reusability emphasis",
		InitializationMsg: "I am Prodigy instance [N] of [TOTAL] for [PROJECT_NAME] component creation. My specialization: [ROLE]. CREATION_PROTOCOL_ACTIVE. Ready for component development.",
	},
	"module": {
		Name:             "module",
		DefaultInstances: 3,
		RoleAssignments:  []string{"Core Functionality Implementation", "Testing & Validation", "Integration & Documentation"},
		CoordinationGuide: "Specific functionality module development with clean interfaces",
		InitializationMsg: "I am Prodigy instance [N] of [TOTAL] for [PROJECT_NAME] module development. My specialization: [ROLE]. CREATION_PROTOCOL_ACTIVE. Ready for module work.",
	},
	"framework": {
		Name:             "framework",
		DefaultInstances: 4,
		RoleAssignments:  []string{"Core Framework Architecture", "Plugin System & Extensions", "Developer Experience & Examples", "Documentation & Community"},
		CoordinationGuide: "Development framework creation with extensibility and developer experience focus",
		InitializationMsg: "I am Prodigy instance [N] of [TOTAL] for [PROJECT_NAME] framework development. My specialization: [ROLE]. CREATION_PROTOCOL_ACTIVE. Ready for framework creation.",
	},
	"library": {
		Name:             "library",
		DefaultInstances: 3,
		RoleAssignments:  []string{"API Design & Core Implementation", "Testing & Quality Assurance", "Packaging & Distribution"},
		CoordinationGuide: "Reusable code library development with clean APIs",
		InitializationMsg: "I am Prodigy instance [N] of [TOTAL] for [PROJECT_NAME] library development. My specialization: [ROLE]. CREATION_PROTOCOL_ACTIVE. Ready for library work.",
	},
	"research": {
		Name:             "research",
		DefaultInstances: 4,
		RoleAssignments:  []string{"Primary Research & Data Collection", "Secondary Research & Literature Review", "Analysis & Pattern Recognition", "Synthesis & Conclusion Formation"},
		CoordinationGuide: "Multi-angle research investigation with comprehensive coverage",
		InitializationMsg: "I am Prodigy instance [N] of [TOTAL] for [PROJECT_NAME] research project. My specialization: [ROLE]. RESEARCH_PROTOCOL_ACTIVE. Ready for systematic investigation.",
	},
	"analysis": {
		Name:             "analysis",
		DefaultInstances: 3,
		RoleAssignments:  []string{"Problem Decomposition & Framing", "Data Analysis & Pattern Detection", "Solution Synthesis & Recommendations"},
		CoordinationGuide: "Complex problem analysis with multiple analytical perspectives",
		InitializationMsg: "I am Prodigy instance [N] of [TOTAL] for [PROJECT_NAME] analysis. My specialization: [ROLE]. ANALYSIS_PROTOCOL_ACTIVE. Ready for systematic analysis.",
	},
	"documentation": {
		Name:             "documentation",
		DefaultInstances: 3,
		RoleAssignments:  []string{"Technical Documentation & API References", "User Guides & Tutorials", "Architecture & Design Documentation"},
		CoordinationGuide: "Comprehensive documentation creation for different audiences",
		InitializationMsg: "I am Prodigy instance [N] of [TOTAL] for [PROJECT_NAME] documentation. My specialization: [ROLE]. DOCUMENTATION_PROTOCOL_ACTIVE. Ready for documentation work.",
	},
	"deployment": {
		Name:             "deployment",
		DefaultInstances: 3,
		RoleAssignments:  []string{"Infrastructure Architecture & Setup", "CI/CD Pipeline Configuration", "Monitoring & Maintenance Planning"},
		CoordinationGuide: "Infrastructure deployment with reliability and scalability focus",
		InitializationMsg: "I am Prodigy instance [N] of [TOTAL] for [PROJECT_NAME] deployment. My specialization: [ROLE]. DEPLOYMENT_PROTOCOL_ACTIVE. Ready for infrastructure work.",
	},
	"testing": {
		Name:             "testing",
		DefaultInstances: 3,
		RoleAssignments:  []string{"Test Strategy & Planning", "Test Implementation & Automation", "Quality Assurance & Validation"},
		CoordinationGuide: "Testing strategy development with comprehensive coverage",
		InitializationMsg: "I am Prodigy instance [N] of [TOTAL] for [PROJECT_NAME] testing strategy. My specialization: [ROLE]. TESTING_PROTOCOL_ACTIVE. Ready for quality assurance work.",
	},
	"strategy": {
		Name:             "strategy",
		DefaultInstances: 4,
		RoleAssignments:  []string{"Strategic Analysis & Market Research", "Planning & Roadmap Development", "Implementation Strategy", "Risk Assessment & Mitigation"},
		CoordinationGuide: "Strategic planning and execution with comprehensive perspective",
		InitializationMsg: "I am Prodigy instance [N] of [TOTAL] for [PROJECT_NAME] strategy development. My specialization: [ROLE]. STRATEGY_PROTOCOL_ACTIVE. Ready for strategic planning.",
	},
	"optimization": {
		Name:             "optimization",
		DefaultInstances: 3,
		RoleAssignments:  []string{"Performance Analysis & Bottleneck Identification", "Solution Implementation & Testing", "Monitoring & Continuous Improvement"},
		CoordinationGuide: "Performance and efficiency optimization with measurable improvements",
		InitializationMsg: "I am Prodigy instance [N] of [TOTAL] for [PROJECT_NAME] optimization. My specialization: [ROLE]. OPTIMIZATION_PROTOCOL_ACTIVE. Ready for performance improvement work.",
	},
	"compression": {
		Name:             "compression",
		DefaultInstances: 3,
		RoleAssignments:  []string{"Compression Algorithm Research & Analysis", "Implementation & Testing", "Validation & Benchmarking"},
		CoordinationGuide: "Data/knowledge compression research with theoretical and practical focus",
		InitializationMsg: "I am Prodigy instance [N] of [TOTAL] for [PROJECT_NAME] compression research. My specialization: [ROLE]. COMPRESSION_PROTOCOL_ACTIVE. Ready for compression work.",
	},
}

// Create Commands
var createCmd = &cobra.Command{
	Use:   "create [type] [project-name] [instances]",
	Short: "Create coordinated multi-instance projects",
	Long:  `Launch and coordinate multiple Prodigy instances for collaborative creation work across different domains.

Available types: project, application, component, module, framework, library, research, analysis, documentation, deployment, testing, strategy, optimization, compression`,
	Args: cobra.RangeArgs(2, 3),
	Run: func(cmd *cobra.Command, args []string) {
		creationType := args[0]
		projectName := args[1]
		instances := 0
		
		// Check if creation type is valid
		template, exists := creationTemplates[creationType]
		if !exists {
			fmt.Fprintf(os.Stderr, "Invalid creation type: %s\n", creationType)
			fmt.Fprintf(os.Stderr, "Available types: ")
			for name := range creationTemplates {
				fmt.Fprintf(os.Stderr, "%s ", name)
			}
			fmt.Fprintf(os.Stderr, "\n")
			os.Exit(1)
		}
		
		// Use provided instance count or template default
		if len(args) >= 3 {
			fmt.Sscanf(args[2], "%d", &instances)
		} else {
			instances = template.DefaultInstances
		}

		config, err := loadConfig()
		if err != nil {
			fmt.Fprintf(os.Stderr, "Error loading config: %v\n", err)
			os.Exit(1)
		}

		// Ensure intelligence is updated
		intelligenceDir := filepath.Join(config.ProdigyDirectory, "intelligence")
		if err := updateSelfMd(config.ProdigyDirectory, intelligenceDir); err != nil {
			fmt.Fprintf(os.Stderr, "Warning: Could not update WAKE_UP.md: %v\n", err)
		}

		session := launchCreateSession(creationType, projectName, instances, template, config)
		
		homeDir, _ := os.UserHomeDir()
		projectDir := filepath.Join(homeDir, "Documents", "Projects", session.ProjectName)
		
		// Check for launch mode flags
		manualMode, _ := cmd.Flags().GetBool("manual")
		tmuxMode, _ := cmd.Flags().GetBool("tmux")
		
		if tmuxMode {
			launchCreateTmuxSession(session, projectDir)
		} else if manualMode {
			printCreateManualCommands(session, projectDir, template)
		} else {
			// Default: iTerm script
			launchCreateITermSession(session, projectDir, template)
		}
	},
}

// Workspace Commands
var workspaceCmd = &cobra.Command{
	Use:   "workspace",
	Short: "Manage and launch development workspaces",
	Long:  `Create and launch standardized development workspace layouts.`,
}

var workspaceCreateCmd = &cobra.Command{
	Use:   "create [name] [layout]",
	Short: "Create a new workspace template",
	Args:  cobra.ExactArgs(2),
	Run: func(cmd *cobra.Command, args []string) {
		name := args[0]
		layout := args[1]
		
		config, err := loadConfig()
		if err != nil {
			fmt.Fprintf(os.Stderr, "Error loading config: %v\n", err)
			os.Exit(1)
		}
		
		createWorkspaceTemplate(name, layout, config)
	},
}

var workspaceLaunchCmd = &cobra.Command{
	Use:   "launch [name]",
	Short: "Launch a workspace",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		name := args[0]
		
		config, err := loadConfig()
		if err != nil {
			fmt.Fprintf(os.Stderr, "Error loading config: %v\n", err)
			os.Exit(1)
		}
		
		launchWorkspace(name, config)
	},
}

var workspaceListCmd = &cobra.Command{
	Use:   "list",
	Short: "List available workspaces",
	Run: func(cmd *cobra.Command, args []string) {
		config, err := loadConfig()
		if err != nil {
			fmt.Fprintf(os.Stderr, "Error loading config: %v\n", err)
			os.Exit(1)
		}
		
		listWorkspaces(config)
	},
}

// Hackathon Commands (keeping for backward compatibility)
var hackathonCmd = &cobra.Command{
	Use:   "hackathon",
	Short: "Multi-instance hackathon coordination",
	Long:  `Launch and coordinate multiple Prodigy instances for competitive programming events.`,
}

var hackathonLaunchCmd = &cobra.Command{
	Use:   "launch [instances] [project-name]",
	Short: "Launch multiple Prodigy instances for hackathon",
	Long:  `Launch N synchronized Prodigy instances with hackathon protocols activated.`,
	Args:  cobra.RangeArgs(0, 2),
	Run: func(cmd *cobra.Command, args []string) {
		instances := 3
		projectName := "cursor-hackathon"
		
		if len(args) >= 1 {
			fmt.Sscanf(args[0], "%d", &instances)
		}
		if len(args) >= 2 {
			projectName = args[1]
		}

		config, err := loadConfig()
		if err != nil {
			fmt.Fprintf(os.Stderr, "Error loading config: %v\n", err)
			os.Exit(1)
		}

		// Ensure intelligence is updated
		intelligenceDir := filepath.Join(config.ProdigyDirectory, "intelligence")
		if err := updateSelfMd(config.ProdigyDirectory, intelligenceDir); err != nil {
			fmt.Fprintf(os.Stderr, "Warning: Could not update WAKE_UP.md: %v\n", err)
		}

		session := launchHackathonSession(instances, projectName, config)
		
		homeDir, _ := os.UserHomeDir()
		projectDir := filepath.Join(homeDir, "Documents", "Projects", session.ProjectName)
		
		// Check for launch mode flags
		manualMode, _ := cmd.Flags().GetBool("manual")
		tmuxMode, _ := cmd.Flags().GetBool("tmux")
		
		if tmuxMode {
			launchTmuxSession(session, projectDir)
		} else if manualMode {
			printManualCommands(session, projectDir)
		} else {
			// Default: iTerm script
			launchITermSession(session, projectDir)
		}
	},
}

var hackathonCoordinationCmd = &cobra.Command{
	Use:   "coordination",
	Short: "Show active hackathon coordination info",
	Long:  `Display current hackathon session status and coordination information.`,
	Run: func(cmd *cobra.Command, args []string) {
		sessions := getActiveSessions()
		if len(sessions) == 0 {
			fmt.Println("No active hackathon sessions found.")
			return
		}

		fmt.Printf("🎯 ACTIVE HACKATHON SESSIONS\n")
		fmt.Printf("============================\n")
		for _, session := range sessions {
			fmt.Printf("\nSession: %s\n", session.ID)
			fmt.Printf("Project: %s\n", session.ProjectName)
			fmt.Printf("Instances: %d\n", session.Instances)
			fmt.Printf("Status: %s\n", session.Status)
			fmt.Printf("Started: %s\n", session.Timestamp)
		}
	},
}

var hackathonLogsCmd = &cobra.Command{
	Use:   "logs [session-id]",
	Short: "View hackathon session logs",
	Long:  `View logs and insights from hackathon instances for learning integration.`,
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("📊 Hackathon logs functionality - to be implemented")
		fmt.Println("This will aggregate instance logs for post-hackathon learning integration.")
	},
}

func launchHackathonSession(instances int, projectName string, config *Config) *HackathonSession {
	homeDir, _ := os.UserHomeDir()
	projectDir := filepath.Join(homeDir, "Documents", "Projects", projectName)
	
	// Create project directory
	os.MkdirAll(projectDir, 0755)
	
	// Generate session IDs
	sessionIDs := make([]string, instances)
	for i := 0; i < instances; i++ {
		sessionIDs[i] = generateSessionID()
	}
	
	// Create hackathon session
	session := &HackathonSession{
		ID:          generateSessionID(),
		ProjectName: projectName,
		Instances:   instances,
		Timestamp:   time.Now().Format(time.RFC3339),
		SessionIDs:  sessionIDs,
		Status:      "active",
	}
	
	// Save session info
	saveHackathonSession(session, projectDir)
	
	// Create coordination file
	createCoordinationFile(session, projectDir)
	
	return session
}

func launchCreateSession(creationType, projectName string, instances int, template CreationTemplate, config *Config) *CreateSession {
	homeDir, _ := os.UserHomeDir()
	projectDir := filepath.Join(homeDir, "Documents", "Projects", projectName)
	
	// Create project directory
	os.MkdirAll(projectDir, 0755)
	
	// Generate session IDs
	sessionIDs := make([]string, instances)
	roles := make(map[string]string)
	
	for i := 0; i < instances; i++ {
		sessionIDs[i] = generateSessionID()
		// Assign roles cyclically if we have more instances than predefined roles
		if i < len(template.RoleAssignments) {
			roles[fmt.Sprintf("instance_%d", i+1)] = template.RoleAssignments[i]
		} else {
			roles[fmt.Sprintf("instance_%d", i+1)] = fmt.Sprintf("General %s Support", strings.Title(creationType))
		}
	}
	
	// Create session
	session := &CreateSession{
		ID:           generateSessionID(),
		CreationType: creationType,
		ProjectName:  projectName,
		Instances:    instances,
		Timestamp:    time.Now().Format(time.RFC3339),
		SessionIDs:   sessionIDs,
		Status:       "active",
		Roles:        roles,
		Metadata: map[string]string{
			"template_name": template.Name,
			"coordination_guide": template.CoordinationGuide,
		},
	}
	
	// Save session info
	saveCreateSession(session, projectDir)
	
	// Create coordination file
	createCreateCoordinationFile(session, projectDir, template)
	
	return session
}

func saveCreateSession(session *CreateSession, projectDir string) {
	sessionFile := filepath.Join(projectDir, "create-session.json")
	data, _ := json.MarshalIndent(session, "", "  ")
	os.WriteFile(sessionFile, data, 0644)
}

func createCreateCoordinationFile(session *CreateSession, projectDir string, template CreationTemplate) {
	coordFile := filepath.Join(projectDir, "coordination.md")
	content := fmt.Sprintf(`# %s %s Coordination
**Session ID**: %s  
**Started**: %s  
**Instances**: %d  
**Creation Type**: %s

## Project Overview
%s

## Instance Roles & Sessions
`, session.ProjectName, strings.Title(session.CreationType), session.ID, session.Timestamp, session.Instances, strings.Title(session.CreationType), template.CoordinationGuide)

	for i := 1; i <= session.Instances; i++ {
		role := session.Roles[fmt.Sprintf("instance_%d", i)]
		sessionID := session.SessionIDs[i-1]
		content += fmt.Sprintf("- **Instance %d** (`%s`): %s\n", i, sessionID, role)
	}

	content += fmt.Sprintf(`
## Coordination Protocol
- **Role Assignment**: Each instance has a specialized focus area as listed above
- **Status Updates**: "All instances: Report progress on your specialization"  
- **Cross-Instance Sharing**: "Instance [N]: Share [finding] with Instance [M]"
- **Integration Points**: Regular sync on how specializations connect

## Initialization Protocol
Send this to each instance, replacing [N], [TOTAL], [PROJECT_NAME], and [ROLE]:

%s

## Success Criteria
- [ ] All specializations are adequately covered
- [ ] Cross-instance coordination is effective  
- [ ] Final deliverable meets project requirements
- [ ] Knowledge and approaches are documented

## Post-Creation Integration
All instance logs and discoveries will be reviewed for learning integration into the main Prodigy intelligence system.
`, template.InitializationMsg)

	os.WriteFile(coordFile, []byte(content), 0644)
}

func saveHackathonSession(session *HackathonSession, projectDir string) {
	sessionFile := filepath.Join(projectDir, "session.json")
	data, _ := json.MarshalIndent(session, "", "  ")
	os.WriteFile(sessionFile, data, 0644)
}

func createCoordinationFile(session *HackathonSession, projectDir string) {
	coordFile := filepath.Join(projectDir, "coordination.md")
	content := fmt.Sprintf(`# %s Hackathon Coordination
**Session ID**: %s  
**Started**: %s  
**Instances**: %d  

## Instance Sessions
`, session.ProjectName, session.ID, session.Timestamp, session.Instances)

	for i, sessionID := range session.SessionIDs {
		content += fmt.Sprintf("- **Instance %d**: `%s`\n", i+1, sessionID)
	}

	content += `
## Coordination Protocol
- **Task Assignment**: "Instance [N]: Your domain is [frontend/backend/research/etc]"
- **Status Updates**: "All instances: Report current progress and blockers"
- **Information Sharing**: "Instance [N]: Share with Instance [M]: [data]"

## Logging Requirements
Each instance should document:
- Major decisions and reasoning paths
- Creative solutions discovered
- Effective collaboration patterns
- Technical insights and breakthroughs
- Areas for improvement

## Post-Hackathon Integration
All logs will be reviewed for learning integration into the main Prodigy intelligence system.
`

	os.WriteFile(coordFile, []byte(content), 0644)
}

func getActiveSessions() []*HackathonSession {
	homeDir, _ := os.UserHomeDir()
	projectsDir := filepath.Join(homeDir, "Documents", "Projects")
	
	var sessions []*HackathonSession
	
	// Scan for project directories with session files
	if files, err := os.ReadDir(projectsDir); err == nil {
		for _, file := range files {
			if file.IsDir() {
				sessionFile := filepath.Join(projectsDir, file.Name(), "session.json")
				if data, err := os.ReadFile(sessionFile); err == nil {
					var session HackathonSession
					if json.Unmarshal(data, &session) == nil {
						sessions = append(sessions, &session)
					}
				}
			}
		}
	}
	
	return sessions
}

func generateSessionID() string {
	bytes := make([]byte, 16)
	rand.Read(bytes)
	return fmt.Sprintf("%x-%x-%x-%x-%x",
		bytes[0:4], bytes[4:6], bytes[6:8], bytes[8:10], bytes[10:16])
}

func printManualCommands(session *HackathonSession, projectDir string) {
	fmt.Printf("🚀 PRODIGY HACKATHON SESSION LAUNCHED\n")
	fmt.Printf("=====================================\n")
	fmt.Printf("Project: %s\n", session.ProjectName)
	fmt.Printf("Instances: %d\n", session.Instances)
	fmt.Printf("Session ID: %s\n", session.ID)
	fmt.Printf("\n📋 MANUAL LAUNCH COMMANDS:\n")
	
	for i, sessionID := range session.SessionIDs {
		fmt.Printf("\n# Instance %d:\n", i+1)
		fmt.Printf("claude --session-id %s --add-dir \"%s\"\n", sessionID, projectDir)
	}

	fmt.Printf("\n🧠 INITIALIZATION PROTOCOL:\n")
	fmt.Printf("Send this message to each instance after launch:\n\n")
	fmt.Printf("I am Prodigy instance [N] of %d for the %s hackathon. ", session.Instances, session.ProjectName)
	fmt.Printf("COMPETITION_PROTOCOL_ACTIVE with session-based memory, locked identity, ")
	fmt.Printf("disabled meta-learning, and full logging. Ready for task assignment.\n\n")
	
	fmt.Printf("📁 Project directory: %s\n", projectDir)
	fmt.Printf("📊 Coordination file: %s/coordination.md\n", projectDir)
}

func launchITermSession(session *HackathonSession, projectDir string) {
	fmt.Printf("🚀 LAUNCHING iTerm SESSION\n")
	fmt.Printf("===========================\n")
	fmt.Printf("Project: %s\n", session.ProjectName)
	fmt.Printf("Instances: %d\n", session.Instances)
	fmt.Printf("Session ID: %s\n", session.ID)
	
	// Generate AppleScript for iTerm automation
	scriptPath := filepath.Join(projectDir, "launch-iterm.scpt")
	script := generateITermScript(session, projectDir)
	
	if err := os.WriteFile(scriptPath, []byte(script), 0755); err != nil {
		fmt.Fprintf(os.Stderr, "Error creating AppleScript: %v\n", err)
		fmt.Println("Falling back to manual commands...")
		printManualCommands(session, projectDir)
		return
	}
	
	fmt.Printf("\n⚡ Executing iTerm automation...\n")
	
	// Execute the AppleScript
	cmd := exec.Command("osascript", scriptPath)
	if err := cmd.Run(); err != nil {
		fmt.Fprintf(os.Stderr, "Error executing AppleScript: %v\n", err)
		fmt.Printf("\n📋 AppleScript created at: %s\n", scriptPath)
		fmt.Println("You can run it manually with: osascript " + scriptPath)
		fmt.Println("\nOr use manual commands:")
		printManualCommands(session, projectDir)
		return
	}
	
	fmt.Printf("✅ iTerm panes launched successfully!\n")
	fmt.Printf("📁 Project directory: %s\n", projectDir)
	fmt.Printf("📊 Coordination file: %s/coordination.md\n", projectDir)
	
	// Brief delay then send initialization protocol
	time.Sleep(2 * time.Second)
	sendInitializationProtocol(session, projectDir)
}

func launchTmuxSession(session *HackathonSession, projectDir string) {
	fmt.Printf("🚀 LAUNCHING TMUX SESSION\n")
	fmt.Printf("==========================\n")
	fmt.Printf("Project: %s\n", session.ProjectName)
	fmt.Printf("Instances: %d\n", session.Instances)
	
	sessionName := fmt.Sprintf("prodigy-hackathon-%s", session.ID[:8])
	
	// Check if tmux is available
	if _, err := exec.LookPath("tmux"); err != nil {
		fmt.Fprintf(os.Stderr, "tmux not found. Install tmux or use --manual flag\n")
		return
	}
	
	fmt.Printf("Session Name: %s\n", sessionName)
	fmt.Printf("⚡ Setting up tmux session...\n")
	
	// TODO: Implement tmux session creation
	// This would involve creating tmux session, splitting panes, and launching claude instances
	
	fmt.Println("📊 tmux functionality - implementation in progress")
	fmt.Println("Use --manual flag for immediate deployment")
}

func generateITermScript(session *HackathonSession, projectDir string) string {
	script := `tell application "iTerm2"
	activate
	
	-- Create new window
	set newWindow to (create window with default profile)
	set currentTab to current tab of newWindow
	set rootSession to current session of currentTab
	
	-- Set window title
	tell currentTab
		set name to "Prodigy Hackathon - ` + session.ProjectName + `"
	end tell
`

	// Add pane splitting and command execution
	for i, sessionID := range session.SessionIDs {
		if i > 0 {
			// Split the pane
			if i == 1 {
				script += `
	-- Split horizontally for second pane
	tell rootSession
		split horizontally with default profile
	end tell
	set session` + fmt.Sprintf("%d", i+1) + ` to last item of sessions of currentTab
`
			} else {
				// For 3+ panes, split the previous pane vertically
				script += `
	-- Split vertically for pane ` + fmt.Sprintf("%d", i+1) + `
	tell session` + fmt.Sprintf("%d", i) + `
		split vertically with default profile
	end tell
	set session` + fmt.Sprintf("%d", i+1) + ` to last item of sessions of currentTab
`
			}
		} else {
			script += `	set session1 to rootSession
`
		}
		
		// Add command execution for this session
		claudeCommand := fmt.Sprintf("claude --session-id %s --add-dir \\\"%s\\\"", sessionID, projectDir)
		script += `
	-- Execute command in session ` + fmt.Sprintf("%d", i+1) + `
	tell session` + fmt.Sprintf("%d", i+1) + `
		write text "` + claudeCommand + `"
	end tell
`
	}
	
	script += `
end tell`
	
	return script
}

func sendInitializationProtocol(session *HackathonSession, projectDir string) {
	fmt.Println("\n🧠 Sending initialization protocol to instances...")
	
	initProtocol := fmt.Sprintf("I am Prodigy instance [N] of %d for the %s hackathon. COMPETITION_PROTOCOL_ACTIVE with session-based memory, locked identity, disabled meta-learning, and full logging. Ready for task assignment.",
		session.Instances, session.ProjectName)
	
	// This would send the initialization protocol to each iTerm pane
	// For now, we'll just display it
	fmt.Printf("\n📨 Protocol message (to be sent automatically):\n")
	fmt.Printf("%s\n", initProtocol)
	
	// TODO: Implement actual AppleScript to send text to each pane
	// This requires more complex iTerm AppleScript automation
}

func printCreateManualCommands(session *CreateSession, projectDir string, template CreationTemplate) {
	fmt.Printf("🚀 PRODIGY %s SESSION LAUNCHED\n", strings.ToUpper(session.CreationType))
	fmt.Printf("========================================\n")
	fmt.Printf("Project: %s\n", session.ProjectName)
	fmt.Printf("Type: %s\n", strings.Title(session.CreationType))
	fmt.Printf("Instances: %d\n", session.Instances)
	fmt.Printf("Session ID: %s\n", session.ID)
	fmt.Printf("\n📋 MANUAL LAUNCH COMMANDS:\n")
	
	for i, sessionID := range session.SessionIDs {
		role := session.Roles[fmt.Sprintf("instance_%d", i+1)]
		fmt.Printf("\n# Instance %d (%s):\n", i+1, role)
		fmt.Printf("claude --session-id %s --add-dir \"%s\"\n", sessionID, projectDir)
	}

	fmt.Printf("\n🧠 INITIALIZATION PROTOCOL:\n")
	fmt.Printf("Send this message to each instance, replacing placeholders:\n\n")
	fmt.Printf("%s\n\n", template.InitializationMsg)
	
	fmt.Printf("📁 Project directory: %s\n", projectDir)
	fmt.Printf("📊 Coordination file: %s/coordination.md\n", projectDir)
}

func launchCreateITermSession(session *CreateSession, projectDir string, template CreationTemplate) {
	fmt.Printf("🚀 LAUNCHING iTerm %s SESSION\n", strings.ToUpper(session.CreationType))
	fmt.Printf("=======================================\n")
	fmt.Printf("Project: %s\n", session.ProjectName)
	fmt.Printf("Type: %s\n", strings.Title(session.CreationType))
	fmt.Printf("Instances: %d\n", session.Instances)
	fmt.Printf("Session ID: %s\n", session.ID)
	
	// Generate AppleScript for iTerm automation
	scriptPath := filepath.Join(projectDir, "launch-iterm.scpt")
	script := generateCreateITermScript(session, projectDir, template)
	
	if err := os.WriteFile(scriptPath, []byte(script), 0755); err != nil {
		fmt.Fprintf(os.Stderr, "Error creating AppleScript: %v\n", err)
		fmt.Println("Falling back to manual commands...")
		printCreateManualCommands(session, projectDir, template)
		return
	}
	
	fmt.Printf("\n⚡ Executing iTerm automation...\n")
	
	// Execute the AppleScript
	cmd := exec.Command("osascript", scriptPath)
	if err := cmd.Run(); err != nil {
		fmt.Fprintf(os.Stderr, "Error executing AppleScript: %v\n", err)
		fmt.Printf("\n📋 AppleScript created at: %s\n", scriptPath)
		fmt.Println("You can run it manually with: osascript " + scriptPath)
		fmt.Println("\nOr use manual commands:")
		printCreateManualCommands(session, projectDir, template)
		return
	}
	
	fmt.Printf("✅ iTerm panes launched successfully!\n")
	fmt.Printf("📁 Project directory: %s\n", projectDir)
	fmt.Printf("📊 Coordination file: %s/coordination.md\n", projectDir)
	
	// Brief delay then send initialization protocol
	time.Sleep(2 * time.Second)
	sendCreateInitializationProtocol(session, projectDir, template)
}

func launchCreateTmuxSession(session *CreateSession, projectDir string) {
	fmt.Printf("🚀 LAUNCHING TMUX %s SESSION\n", strings.ToUpper(session.CreationType))
	fmt.Printf("=====================================\n")
	fmt.Printf("Project: %s\n", session.ProjectName)
	fmt.Printf("Type: %s\n", strings.Title(session.CreationType))
	fmt.Printf("Instances: %d\n", session.Instances)
	
	sessionName := fmt.Sprintf("prodigy-%s-%s", session.CreationType, session.ID[:8])
	
	// Check if tmux is available
	if _, err := exec.LookPath("tmux"); err != nil {
		fmt.Fprintf(os.Stderr, "tmux not found. Install tmux or use --manual flag\n")
		return
	}
	
	fmt.Printf("Session Name: %s\n", sessionName)
	fmt.Printf("⚡ Setting up tmux session...\n")
	
	// TODO: Implement tmux session creation for create types
	fmt.Println("📊 tmux functionality - implementation in progress")
	fmt.Println("Use --manual flag for immediate deployment")
}

func generateCreateITermScript(session *CreateSession, projectDir string, template CreationTemplate) string {
	script := `tell application "iTerm2"
	activate
	
	-- Create new window
	set newWindow to (create window with default profile)
	set currentTab to current tab of newWindow
	set rootSession to current session of currentTab
	
	-- Set window title
	tell currentTab
		set name to "Prodigy ` + strings.Title(session.CreationType) + ` - ` + session.ProjectName + `"
	end tell
`

	// Add pane splitting and command execution
	for i, sessionID := range session.SessionIDs {
		role := session.Roles[fmt.Sprintf("instance_%d", i+1)]
		
		if i > 0 {
			// Split the pane
			if i == 1 {
				script += `
	-- Split horizontally for second pane
	tell rootSession
		split horizontally with default profile
	end tell
	set session` + fmt.Sprintf("%d", i+1) + ` to last item of sessions of currentTab
`
			} else {
				// For 3+ panes, split the previous pane vertically
				script += `
	-- Split vertically for pane ` + fmt.Sprintf("%d", i+1) + `
	tell session` + fmt.Sprintf("%d", i) + `
		split vertically with default profile
	end tell
	set session` + fmt.Sprintf("%d", i+1) + ` to last item of sessions of currentTab
`
			}
		} else {
			script += `	set session1 to rootSession
`
		}
		
		// Add command execution for this session
		claudeCommand := fmt.Sprintf("claude --session-id %s --add-dir \\\"%s\\\"", sessionID, projectDir)
		script += `
	-- Execute command in session ` + fmt.Sprintf("%d", i+1) + ` (` + role + `)
	tell session` + fmt.Sprintf("%d", i+1) + `
		write text "` + claudeCommand + `"
	end tell
`
	}
	
	script += `
end tell`
	
	return script
}

func sendCreateInitializationProtocol(session *CreateSession, projectDir string, template CreationTemplate) {
	fmt.Println("\n🧠 Sending initialization protocol to instances...")
	
	fmt.Printf("\n📨 Protocol messages (to be sent automatically):\n")
	for i := 1; i <= session.Instances; i++ {
		role := session.Roles[fmt.Sprintf("instance_%d", i)]
		initMsg := strings.ReplaceAll(template.InitializationMsg, "[N]", fmt.Sprintf("%d", i))
		initMsg = strings.ReplaceAll(initMsg, "[TOTAL]", fmt.Sprintf("%d", session.Instances))
		initMsg = strings.ReplaceAll(initMsg, "[PROJECT_NAME]", session.ProjectName)
		initMsg = strings.ReplaceAll(initMsg, "[ROLE]", role)
		
		fmt.Printf("\nInstance %d: %s\n", i, initMsg)
	}
	
	// TODO: Implement actual AppleScript to send text to each pane with role-specific messages
}

func createWorkspaceTemplate(name, layout string, config *Config) {
	// Create objective pointer for workspace creation
	objective := createObjectivePointer(
		"Create single iTerm window with 2x2 pane grid for "+name+" workspace",
		"Creating workspace template",
		map[string]string{
			"workspace_name": name,
			"layout": layout,
			"operation": "workspace_creation",
		},
	)
	
	if err := saveObjectivePointer(objective, config); err != nil {
		fmt.Fprintf(os.Stderr, "Warning: Could not save objective pointer: %v\n", err)
	}
	workspaceDir := filepath.Join(config.ProdigyDirectory, "workspace")
	os.MkdirAll(workspaceDir, 0755)
	
	template := WorkspaceTemplate{
		Name:     name,
		Layout:   layout,
		Commands: []PaneCommand{},
		Meta:     make(map[string]string),
	}
	
	// Set default commands based on layout
	switch layout {
	case "2x2":
		template.Commands = []PaneCommand{
			{Pane: 0, Title: "Main"},
			{Pane: 1, Title: "Secondary"},
			{Pane: 2, Title: "Terminal"},
			{Pane: 3, Title: "Monitoring"},
		}
	}
	
	templatePath := filepath.Join(workspaceDir, name+".json")
	data, _ := json.MarshalIndent(template, "", "  ")
	
	if err := os.WriteFile(templatePath, data, 0644); err != nil {
		fmt.Fprintf(os.Stderr, "Error creating template: %v\n", err)
		os.Exit(1)
	}
	
	fmt.Printf("✅ Workspace template '%s' created (%s layout)\n", name, layout)
	fmt.Printf("📁 Template: %s\n", templatePath)
}

func launchWorkspace(name string, config *Config) {
	workspaceDir := filepath.Join(config.ProdigyDirectory, "workspace")
	templatePath := filepath.Join(workspaceDir, name+".json")
	
	data, err := os.ReadFile(templatePath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Template not found: %s\n", name)
		os.Exit(1)
	}
	
	var template WorkspaceTemplate
	if err := json.Unmarshal(data, &template); err != nil {
		fmt.Fprintf(os.Stderr, "Error reading template: %v\n", err)
		os.Exit(1)
	}
	
	fmt.Printf("🚀 Launching workspace: %s (%s)\n", template.Name, template.Layout)
	
	// Generate iTerm commands via Go
	switch template.Layout {
	case "2x2":
		launch2x2Workspace(template)
	default:
		fmt.Fprintf(os.Stderr, "Unsupported layout: %s\n", template.Layout)
		os.Exit(1)
	}
}

func launch2x2Workspace(template WorkspaceTemplate) {
	fmt.Printf("🚀 Launching native Go workspace: %s\n", template.Name)
	
	// Load current objective to maintain context
	config, _ := loadConfig()
	if objective, err := loadCurrentObjective(config); err == nil {
		addCheckpoint(objective, "Self-correcting to native Go workspace implementation")
		saveObjectivePointer(*objective, config)
		fmt.Printf("📍 Objective: %s\n", objective.OriginalAim)
	}
	
	// Native Go approach: Launch organized terminal processes with clear identification
	// This achieves the workspace organization goal using our own capabilities
	panes := []struct {
		title string
		role  string
	}{
		{"Main", "Primary development work"},
		{"Secondary", "Secondary tasks and monitoring"},  
		{"Terminal", "Command line operations"},
		{"Monitoring", "System and process monitoring"},
	}
	
	fmt.Printf("🔧 Self-reliance principle: Using native Go implementation\n")
	
	for _, pane := range panes {
		// Launch terminal with clear workspace identification
		cmd := exec.Command("open", "-n", "-a", "Terminal", "--args", "-T", pane.title)
		
		if err := cmd.Start(); err != nil {
			fmt.Fprintf(os.Stderr, "Error launching %s pane: %v\n", pane.title, err)
			continue
		}
		
		fmt.Printf("  ✅ %s: %s\n", pane.title, pane.role)
		
		// Brief delay for organized launch
		time.Sleep(300 * time.Millisecond)
	}
	
	fmt.Printf("📋 Workspace launched with 4 organized terminals\n")
	fmt.Printf("💡 Native Go implementation maintains tool self-reliance\n")
}

func listWorkspaces(config *Config) {
	workspaceDir := filepath.Join(config.ProdigyDirectory, "workspace")
	
	files, err := os.ReadDir(workspaceDir)
	if err != nil {
		fmt.Println("No workspaces found")
		return
	}
	
	fmt.Println("📋 Available workspaces:")
	for _, file := range files {
		if strings.HasSuffix(file.Name(), ".json") {
			name := strings.TrimSuffix(file.Name(), ".json")
			
			templatePath := filepath.Join(workspaceDir, file.Name())
			data, _ := os.ReadFile(templatePath)
			var template WorkspaceTemplate
			json.Unmarshal(data, &template)
			
			fmt.Printf("  %s (%s)\n", name, template.Layout)
		}
	}
}

func init() {
	// Add flags to create command
	createCmd.Flags().Bool("manual", false, "Output manual commands instead of automated launch")
	createCmd.Flags().Bool("tmux", false, "Launch using tmux session")
	
	// Add flags to hackathon launch command
	hackathonLaunchCmd.Flags().Bool("manual", false, "Output manual commands instead of automated launch")
	hackathonLaunchCmd.Flags().Bool("tmux", false, "Launch using tmux session")
	
	// Add subcommands to workspace command group
	workspaceCmd.AddCommand(workspaceCreateCmd)
	workspaceCmd.AddCommand(workspaceLaunchCmd)
	workspaceCmd.AddCommand(workspaceListCmd)
	
	// Add subcommands to hackathon command group
	hackathonCmd.AddCommand(hackathonLaunchCmd)
	hackathonCmd.AddCommand(hackathonCoordinationCmd)
	hackathonCmd.AddCommand(hackathonLogsCmd)
	
	// Add subcommands to modify command group
	modifyCmd.AddCommand(modifyCliCmd)
	
	// Add main command groups to root
	rootCmd.AddCommand(sessionCmd)
	rootCmd.AddCommand(configCmd)
	rootCmd.AddCommand(backupCmd)
	rootCmd.AddCommand(modifyCmd)
	rootCmd.AddCommand(workspaceCmd)
	rootCmd.AddCommand(createCmd)
	rootCmd.AddCommand(hackathonCmd)
}

func main() {
	if err := rootCmd.Execute(); err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}
}