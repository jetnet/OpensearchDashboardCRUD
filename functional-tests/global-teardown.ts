/**
 * Global Teardown for Playwright Tests
 * Runs once after all tests complete
 */

import { execSync } from 'child_process';
import path from 'path';
import { osClient } from './utils/api-client';
import { testIndices } from './fixtures/test-data';

// Configuration
const STOP_CONTAINERS = process.env.STOP_CONTAINERS === 'true';
const CLEANUP_DATA = process.env.CLEANUP_DATA !== 'false';

async function cleanupTestData(): Promise<void> {
  if (!CLEANUP_DATA) {
    console.log('Skipping test data cleanup (CLEANUP_DATA=false)');
    return;
  }
  
  console.log('Cleaning up test data...');
  
  try {
    // Clean up all test indices
    await osClient.cleanupTestIndices();
    console.log('✓ Test indices cleaned up');
  } catch (error) {
    console.warn('Warning: Failed to clean up some indices:', error);
  }
}

async function stopContainers(): Promise<void> {
  if (!STOP_CONTAINERS) {
    console.log('Skipping container shutdown (STOP_CONTAINERS!=true)');
    return;
  }
  
  console.log('Stopping Podman containers...');
  
  const projectRoot = path.resolve(__dirname, '..');
  const composeFile = path.join(projectRoot, 'podman-compose.yml');
  
  try {
    // Try podman-compose first
    execSync(`cd ${projectRoot} && podman-compose -f ${composeFile} down`, {
      stdio: 'inherit',
    });
    console.log('✓ Containers stopped');
  } catch (error) {
    console.log('podman-compose down failed, trying docker-compose...');
    
    try {
      execSync(`cd ${projectRoot} && docker-compose -f ${composeFile} down`, {
        stdio: 'inherit',
      });
      console.log('✓ Containers stopped with docker-compose');
    } catch (dockerError) {
      console.warn('Warning: Failed to stop containers:', dockerError);
    }
  }
}

async function generateReport(): Promise<void> {
  console.log('\n========================================');
  console.log('Test Run Summary');
  console.log('========================================');
  
  // Check if test results exist
  try {
    const fs = await import('fs');
    const resultsPath = path.resolve(__dirname, '../test-output/functional-tests/results.json');
    
    if (fs.existsSync(resultsPath)) {
      const results = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));
      
      if (results.stats) {
        const { expected, unexpected, skipped, flaky } = results.stats;
        const passed = expected - unexpected;
        
        console.log(`\nTotal Tests: ${expected}`);
        console.log(`Passed: ${passed} ✓`);
        console.log(`Failed: ${unexpected} ✗`);
        console.log(`Skipped: ${skipped}`);
        console.log(`Flaky: ${flaky}`);
        
        if (unexpected > 0) {
          console.log('\nFailed tests:');
          for (const suite of results.suites || []) {
            for (const spec of suite.specs || []) {
              for (const test of spec.tests || []) {
                for (const result of test.results || []) {
                  if (result.status === 'failed') {
                    console.log(`  - ${suite.title} > ${spec.title}`);
                    if (result.error?.message) {
                      console.log(`    Error: ${result.error.message.split('\n')[0]}`);
                    }
                  }
                }
              }
            }
          }
        }
      }
    } else {
      console.log('\nTest results not found. Run tests to see summary.');
    }
  } catch (error) {
    console.log('\nCould not generate test summary:', error);
  }
}

async function globalTeardown(): Promise<void> {
  console.log('\n========================================');
  console.log('Starting Functional Test Teardown');
  console.log('========================================\n');
  
  const startTime = Date.now();
  
  try {
    // Generate summary report
    await generateReport();
    
    // Clean up test data
    await cleanupTestData();
    
    // Stop containers if requested
    await stopContainers();
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\nTeardown completed in ${duration}s`);
    console.log('========================================\n');
    
  } catch (error) {
    console.error('\n✗ Teardown encountered errors:', error);
    // Don't throw here - we want cleanup to continue even if parts fail
  }
}

export default globalTeardown;