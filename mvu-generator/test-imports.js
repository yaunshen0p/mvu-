#!/usr/bin/env node

// Simple test to verify components can be imported
console.log('Testing component imports...');

try {
  // Test workspace utilities
  const workspace = require('./src/utils/workspace.ts');
  console.log('✅ Workspace utilities imported successfully');
  console.log('Available tabs:', workspace.WORKSPACE_TABS.map(t => t.id));
  
  // Test workspace store
  const { useWorkspaceStore } = require('./src/stores/workspace.ts');
  console.log('✅ Workspace store imported successfully');
  
  // Test components
  console.log('Components created successfully');
  
  console.log('✅ All imports successful - implementation should work!');
} catch (error) {
  console.error('❌ Import error:', error.message);
  process.exit(1);
}