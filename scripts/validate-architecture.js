#!/usr/bin/env node

/**
 * Architecture Validation Script
 * Enforces the three non-negotiable architectural patterns
 */

const fs = require('fs')
const path = require('path')

const VIOLATIONS = []

function checkManifestFirst() {
  const srcDir = path.join(__dirname, '../src')
  const uiFiles = []

  function findFiles(dir, ext) {
    const files = fs.readdirSync(dir)
    files.forEach(file => {
      const filePath = path.join(dir, file)
      const stat = fs.statSync(filePath)

      if (stat.isDirectory()) {
        findFiles(filePath, ext)
      } else if (file.endsWith(ext)) {
        uiFiles.push(filePath)
      }
    })
  }

  findFiles(path.join(srcDir, 'ui'), '.tsx')
  findFiles(path.join(srcDir, 'app'), '.tsx')

  uiFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8')

    // Check for fetch calls that bypass manifest API
    const fetchMatches = content.match(/fetch\(['"`][^'"`]*['"`]/g) || []
    fetchMatches.forEach(match => {
      if (!match.includes('/api/manifest') &&
          !match.includes('/api/rituals') &&
          !match.includes('/api/jobs') &&
          !match.includes('/api/eden-bridge')) {
        VIOLATIONS.push(`❌ MANIFEST-FIRST VIOLATION in ${file}: ${match}`)
      }
    })
  })
}

function checkConfigDriven() {
  const bridgeFile = path.join(__dirname, '../src/services/edenBridge.ts')
  const content = fs.readFileSync(bridgeFile, 'utf-8')

  // Check for configuration-driven mapping
  if (!content.includes('BRIDGE_CONFIG')) {
    VIOLATIONS.push('❌ CONFIG-DRIVEN VIOLATION: Missing BRIDGE_CONFIG in edenBridge.ts')
  }

  if (!content.includes('mappings')) {
    VIOLATIONS.push('❌ CONFIG-DRIVEN VIOLATION: Missing mappings configuration')
  }
}

function checkAuditLogging() {
  const servicesDir = path.join(__dirname, '../src/services')
  const serviceFiles = fs.readdirSync(servicesDir)
    .filter(file => file.endsWith('.ts'))
    .map(file => path.join(servicesDir, file))

  serviceFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8')
    const filename = path.basename(file)

    // Skip audit.ts itself
    if (filename === 'audit.ts') return

    // Check for audit service usage in core services
    if ((filename === 'jobs.ts' || filename === 'edenBridge.ts' || filename === 'manifest.ts') &&
        !content.includes('auditService')) {
      VIOLATIONS.push(`❌ AUDIT-LOG VIOLATION: Missing auditService in ${filename}`)
    }
  })
}

function main() {
  console.log('🔍 Validating Seth Command Center Architecture...\n')

  checkManifestFirst()
  checkConfigDriven()
  checkAuditLogging()

  if (VIOLATIONS.length === 0) {
    console.log('✅ Architecture Validation PASSED')
    console.log('\n🏛️  All non-negotiables enforced:')
    console.log('   • Manifest-First: UI calls proper APIs')
    console.log('   • Config-Driven: Eden bridge uses configuration')
    console.log('   • Audit Logging: Core services instrumented')
    console.log('\n📋 Ready for deployment!')
    process.exit(0)
  } else {
    console.log('❌ Architecture Validation FAILED\n')
    VIOLATIONS.forEach(violation => console.log(violation))
    console.log('\n🚨 Fix violations before deployment')
    process.exit(1)
  }
}

main()