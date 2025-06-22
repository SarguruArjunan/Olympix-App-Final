import * as XLSX from 'xlsx';
import { promises as fs } from 'fs';
import { join } from 'path';
import { DATA_DIR } from '../app';
// Removed unused import SheetName

interface ConversionResult {
  success: boolean;
  message: string;
  filesCreated?: string[];
  errors?: string[];
}

export class ExcelToJsonConverter {
  private static readonly OUTPUT_FILES = {
    Sports: 'sample-sports.json',
    Teams: 'sample-teams.json',
    Players: 'sample-players.json',
    Events: 'sample-events.json',
    Matches: 'sample-matches.json',
    Medals: 'sample-medals.json'
  };

  static async convertExcelToJson(excelFilePath: string): Promise<ConversionResult> {
    const filesCreated: string[] = [];
    const errors: string[] = [];

    try {
      console.log(`📊 Starting Excel to JSON conversion from: ${excelFilePath}`);
      
      // Check if Excel file exists
      try {
        await fs.access(excelFilePath);
      } catch (error) {
        return {
          success: false,
          message: `Excel file not found: ${excelFilePath}`
        };
      }

      // Read Excel file
      console.log('📖 Reading Excel file...');
      const workbook = XLSX.readFile(excelFilePath);
      
      // Ensure data directory exists
      await this.ensureDataDir();

      // Convert each sheet
      for (const [sheetName, outputFile] of Object.entries(this.OUTPUT_FILES)) {
        try {
          console.log(`🔄 Converting sheet: ${sheetName}`);
          
          if (!workbook.Sheets[sheetName]) {
            console.warn(`⚠️ Sheet '${sheetName}' not found in Excel file, skipping...`);
            continue;
          }

          const worksheet = workbook.Sheets[sheetName];
          const data = XLSX.utils.sheet_to_json(worksheet);
          
          // Create JSON structure
          const jsonData = { [sheetName]: data };
          
          // Write to file
          const outputPath = join(DATA_DIR, outputFile);
          await fs.writeFile(outputPath, JSON.stringify(jsonData, null, 2), 'utf-8');
          
          filesCreated.push(outputFile);
          console.log(`✅ Created: ${outputFile} (${data.length} records)`);
          
        } catch (error) {
          const errorMsg = `Failed to convert sheet '${sheetName}': ${error instanceof Error ? error.message : 'Unknown error'}`;
          errors.push(errorMsg);
          console.error(`❌ ${errorMsg}`);
        }
      }

      if (filesCreated.length === 0) {
        return {
          success: false,
          message: 'No JSON files were created',
          errors
        };
      }

      return {
        success: true,
        message: `Successfully converted ${filesCreated.length} sheets to JSON`,
        filesCreated,
        errors: errors.length > 0 ? errors : undefined
      };

    } catch (error) {
      console.error('💥 Excel to JSON conversion failed:', error);
      return {
        success: false,
        message: `Conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  static async createSampleJsonFiles(): Promise<ConversionResult> {
    const filesCreated: string[] = [];
    const errors: string[] = [];

    try {
      console.log('📝 Creating sample JSON files...');
      await this.ensureDataDir();

      const sampleData = {
        Sports: [
          { ID: 1, Name: "Foosball", Icon_URL: "/Icons/foosball.svg", Description: "Table soccer played with rods and miniature players" },
          { ID: 2, Name: "Carrom", Icon_URL: "/Icons/carrom.svg", Description: "Fast-paced tabletop game where players flick discs into pockets" },
          { ID: 3, Name: "Chess", Icon_URL: "/Icons/chess.svg", Description: "Classic strategic board game of kings and queens" }
        ],
        Teams: [
          { ID: 1, Name: "Success Squad", Country: "USA", Logo_URL: "/images/teams/success-squad.png", Organization: "Enablement & Success", TagLine: "Game On,CustGrSnss", Color: "#000000" },
          { ID: 2, Name: "BkNdBoss", Country: "India", Logo_URL: "/images/teams/bkndboss.png", Organization: "G&A", TagLine: "Game On,BkNd Strong!", Color: "#8B4513" }
        ],
        Players: [
          { ID: 1, FirstName: "John", LastName: "Smith", TeamID: 1, SportID: 1 },
          { ID: 2, FirstName: "Sarah", LastName: "Johnson", TeamID: 1, SportID: 3 }
        ],
        Events: [
          { ID: 1, SportID: 1, Name: "Foosball Tournament", Date: "2025-07-01", Time: "10:00:00", Location: "Game Room A", Status: "Scheduled" }
        ],
        Matches: [
          { ID: 1, EventID: 1, ParticipantA_ID: 1, ParticipantB_ID: 2, ScoreA: 0, ScoreB: 0, WinnerID: 0, Status: "Scheduled" }
        ],
        Medals: [
          { ID: 1, TeamID: 1, SportID: 1, Gold: 2, Silver: 1, Bronze: 0, Total: 3 }
        ]
      };

      for (const [sheetName, data] of Object.entries(sampleData)) {
        try {
          const outputFile = this.OUTPUT_FILES[sheetName as keyof typeof this.OUTPUT_FILES];
          const jsonData = { [sheetName]: data };
          
          const outputPath = join(DATA_DIR, outputFile);
          await fs.writeFile(outputPath, JSON.stringify(jsonData, null, 2), 'utf-8');
          
          filesCreated.push(outputFile);
          console.log(`✅ Created sample: ${outputFile}`);
          
        } catch (error) {
          const errorMsg = `Failed to create sample ${sheetName}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          errors.push(errorMsg);
          console.error(`❌ ${errorMsg}`);
        }
      }

      return {
        success: true,
        message: `Successfully created ${filesCreated.length} sample JSON files`,
        filesCreated,
        errors: errors.length > 0 ? errors : undefined
      };

    } catch (error) {
      console.error('💥 Failed to create sample JSON files:', error);
      return {
        success: false,
        message: `Failed to create sample files: ${error instanceof Error ? error.message : 'Unknown error'}`,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  private static async ensureDataDir(): Promise<void> {
    try {
      await fs.access(DATA_DIR);
    } catch {
      await fs.mkdir(DATA_DIR, { recursive: true });
      console.log(`📁 Created data directory: ${DATA_DIR}`);
    }
  }

  // CLI utility function
  static async runConversion(excelPath?: string): Promise<void> {
    console.log('🎯 Excel to JSON Converter Tool');
    console.log('================================');

    if (excelPath) {
      console.log(`📂 Excel file: ${excelPath}`);
      const result = await this.convertExcelToJson(excelPath);
      
      if (result.success) {
        console.log(`✅ ${result.message}`);
        if (result.filesCreated) {
          console.log('📄 Files created:');
          result.filesCreated.forEach(file => console.log(`   - ${file}`));
        }
      } else {
        console.error(`❌ ${result.message}`);
        if (result.errors) {
          console.error('🔍 Errors:');
          result.errors.forEach(error => console.error(`   - ${error}`));
        }
      }
    } else {
      console.log('📝 Creating sample JSON files...');
      const result = await this.createSampleJsonFiles();
      
      if (result.success) {
        console.log(`✅ ${result.message}`);
      } else {
        console.error(`❌ ${result.message}`);
      }
    }
  }
}

// CLI execution
if (require.main === module) {
  const excelPath = process.argv[2];
  ExcelToJsonConverter.runConversion(excelPath).catch(console.error);
}