/**
 * Global Setup for Playwright Tests
 * Runs once before all tests
 */

import { execSync } from 'child_process';
import path from 'path';
import { osClient } from './utils/api-client';
import { testIndices, simpleDocuments, nestedDocuments, arrayDocuments } from './fixtures/test-data';

// Configuration
const START_CONTAINERS = process.env.START_CONTAINERS !== 'false';
const OSD_URL = process.env.OSD_BASE_URL || 'http://localhost:5601';
const OS_URL = process.env.OS_HOST || 'localhost:9200';
const SETUP_TIMEOUT = parseInt(process.env.SETUP_TIMEOUT || '300000', 10); // 5 minutes

async function waitForOSD(timeoutMs: number = 120000, intervalMs: number = 3000): Promise<void> {
  const startTime = Date.now();
  
  console.log('Waiting for OpenSearch Dashboards to be ready...');
  
  while (Date.now() - startTime < timeoutMs) {
    try {
      const response = await fetch(`${OSD_URL}/api/status`);
      if (response.ok) {
        const data = await response.json() as { status?: { overall?: { state?: string } } };
        if (data.status?.overall?.state === 'green' || data.status?.overall?.state === 'yellow') {
          console.log('OpenSearch Dashboards is ready!');
          return;
        }
      }
    } catch {
      // OSD not ready yet
    }
    
    process.stdout.write('.');
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }
  
  throw new Error(`OpenSearch Dashboards did not become ready within ${timeoutMs}ms`);
}

async function setupTestData(): Promise<void> {
  console.log('\nSetting up test data...');
  
  // Wait for OpenSearch to be ready
  await osClient.waitForReady(60000, 2000);
  console.log('OpenSearch is ready!');
  
  // Create test indices
  await osClient.setupTestIndices();
  console.log('Test indices created');
  
  // Insert simple documents
  for (const doc of simpleDocuments) {
    const { id, ...source } = doc;
    await osClient.indexDocument(testIndices.simple, source, id);
  }
  console.log(`Inserted ${simpleDocuments.length} simple documents`);
  
  // Insert nested documents
  for (const doc of nestedDocuments) {
    const { id, ...source } = doc;
    await osClient.indexDocument(testIndices.nested, source, id);
  }
  console.log(`Inserted ${nestedDocuments.length} nested documents`);
  
  // Insert array documents
  for (const doc of arrayDocuments) {
    const { id, ...source } = doc;
    await osClient.indexDocument(testIndices.arrays, source, id);
  }
  console.log(`Inserted ${arrayDocuments.length} array documents`);
  
  // Refresh all indices
  await osClient.refreshIndex(testIndices.simple);
  await osClient.refreshIndex(testIndices.nested);
  await osClient.refreshIndex(testIndices.arrays);
  await osClient.refreshIndex(testIndices.empty);
  console.log('Indices refreshed');
  
  console.log('Test data setup complete!');
}

async function startContainers(): Promise<void> {
  if (!START_CONTAINERS) {
    console.log('Skipping container startup (START_CONTAINERS=false)');
    return;
  }
  
  console.log('Starting Podman containers...');
  
  try {
    // Check if podman-compose is available
    execSync('which podman-compose', { stdio: 'ignore' });
  } catch {
    console.log('podman-compose not found, trying docker-compose...');
    try {
      execSync('which docker-compose', { stdio: 'ignore' });
    } catch {
      console.log('Neither podman-compose nor docker-compose found. Assuming containers are already running.');
      return;
    }
  }
  
  const projectRoot = path.resolve(__dirname, '..');
  const composeFile = path.join(projectRoot, 'podman-compose.yml');
  
  // Check if containers are already running
  try {
    const output = execSync('podman ps --format "{{.Names}}"', { encoding: 'utf-8' });
    if (output.includes('opensearch-dashboards') && output.includes('opensearch-node')) {
      console.log('Containers already running');
      return;
    }
  } catch {
    // Ignore error and try to start containers
  }
  
  // Start containers
  try {
    execSync(`cd ${projectRoot} && podman-compose -f ${composeFile} up -d`, {
      stdio: 'inherit',
    });
    console.log('Containers started successfully');
  } catch (error) {
    console.error('Failed to start containers with podman-compose:', error);
    
    // Try docker-compose as fallback
    try {
      execSync(`cd ${projectRoot} && docker-compose -f ${composeFile} up -d`, {
        stdio: 'inherit',
      });
      console.log('Containers started successfully with docker-compose');
    } catch (dockerError) {
      console.error('Failed to start containers with docker-compose:', dockerError);
      throw new Error('Failed to start containers');
    }
  }
}

async function verifySetup(): Promise<void> {
  console.log('\nVerifying setup...');
  
  // Check OpenSearch
  const osReady = await osClient.health();
  if (!osReady) {
    throw new Error('OpenSearch is not accessible');
  }
  console.log('✓ OpenSearch is accessible');
  
  // Check indices exist
  const indices = await osClient.getIndices();
  const requiredIndices = Object.values(testIndices);
  const missingIndices = requiredIndices.filter(idx => !indices.includes(idx));
  
  if (missingIndices.length > 0) {
    console.warn(`Warning: Some indices are missing: ${missingIndices.join(', ')}`);
  } else {
    console.log('✓ All test indices exist');
  }
  
  // Check OSD
  try {
    await waitForOSD();
    console.log('✓ OpenSearch Dashboards is accessible');
  } catch (error) {
    console.error('✗ OpenSearch Dashboards is not accessible');
    throw error;
  }
  
  console.log('\n✓ Setup verification complete!');
}

async function globalSetup(): Promise<void> {
  console.log('========================================');
  console.log('Starting Functional Test Setup');
  console.log('========================================\n');
  
  const startTime = Date.now();
  
  try {
    // Start containers if needed
    await startContainers();
    
    // Setup test data
    await setupTestData();
    
    // Wait for OSD
    await waitForOSD();
    
    // Verify everything is ready
    await verifySetup();
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\nSetup completed in ${duration}s`);
    console.log('========================================\n');
    
  } catch (error) {
    console.error('\n✗ Setup failed:', error);
    throw error;
  }
}

export default globalSetup;