require('dotenv').config();
const db = require('./db');

async function fixCallTypeConstraint() {
  try {
    console.log('Checking existing CHECK constraints on requirements table...');

    // Find the constraint name
    const constraintRes = await db.query(`
      SELECT con.conname
      FROM pg_constraint con
      JOIN pg_class rel ON rel.oid = con.conrelid
      WHERE rel.relname = 'requirements'
        AND con.contype = 'c'
        AND con.conname LIKE '%call_type%'
    `);

    if (constraintRes.rows.length > 0) {
      const constraintName = constraintRes.rows[0].conname;
      console.log(`Found constraint: ${constraintName} — dropping it...`);
      await db.query(`ALTER TABLE requirements DROP CONSTRAINT IF EXISTS "${constraintName}"`);
      console.log('Constraint dropped.');
    } else {
      console.log('No call_type check constraint found (already clean).');
    }

    // Add a loose constraint: call_type must just be non-empty
    console.log('Adding permissive constraint (non-empty call_type)...');
    await db.query(`
      ALTER TABLE requirements
      ADD CONSTRAINT requirements_call_type_not_empty
      CHECK (call_type IS NOT NULL AND call_type <> '')
    `);
    console.log('New constraint added.');

    // Verify all 4 call types now work
    console.log('Verifying all call_types exist in call_types table...');
    const typesRes = await db.query(`SELECT value, label FROM call_types WHERE is_active = true ORDER BY id`);
    console.log('Active call types:', typesRes.rows.map(r => r.value).join(', '));

    console.log('\nMigration complete! All 4 call types should now work.');
  } catch (error) {
    console.error('Migration failed:', error.message);
  } finally {
    process.exit();
  }
}

fixCallTypeConstraint();
