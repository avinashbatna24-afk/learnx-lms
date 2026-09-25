const db = require('./index');

const migrateResourceUpload = async () => {
  const query = `
    -- Alter resources table to support file metadata and external links
    ALTER TABLE resources ADD COLUMN IF NOT EXISTS source_type VARCHAR(50) DEFAULT 'FILE';
    ALTER TABLE resources ADD COLUMN IF NOT EXISTS file_name VARCHAR(255);
    ALTER TABLE resources ADD COLUMN IF NOT EXISTS original_file_name VARCHAR(255);
    ALTER TABLE resources ADD COLUMN IF NOT EXISTS file_url TEXT;
    ALTER TABLE resources ADD COLUMN IF NOT EXISTS file_size BIGINT;
    ALTER TABLE resources ADD COLUMN IF NOT EXISTS mime_type VARCHAR(100);
    ALTER TABLE resources ADD COLUMN IF NOT EXISTS external_url TEXT;
    ALTER TABLE resources ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

    -- Migrate existing data (assuming old 'url' column meant external link if it starts with http)
    UPDATE resources SET 
      source_type = 'EXTERNAL_LINK', 
      external_url = url 
    WHERE url IS NOT NULL AND url != '' AND external_url IS NULL;

    -- Drop the old 'url' column after successful migration (optional, keeping for safety but we will use external_url)
    -- ALTER TABLE resources DROP COLUMN url;
  `;
  try {
    await db.query(query);
    console.log('Resource File Upload migration completed successfully!');
  } catch (error) {
    console.error('Error during Resource File Upload migration:', error);
  } finally {
    db.pool.end();
  }
};

migrateResourceUpload();
