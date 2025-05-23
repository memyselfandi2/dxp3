/**
 * Script to create a filesystem-based database using dxp3-db
 * and populate it with a large number of records with some duplicate column values.
 */

const path = require('path');
const fs = require('fs').promises; // Node.js file system module

// --- Configuration ---
const DB_FOLDER_NAME = 'my_large_database_files'; // Folder name for database files
const DB_FOLDER = path.join(__dirname, DB_FOLDER_NAME); // Creates folder in the same directory as the script
const DB_NAME = 'performance_test5_db';
const TABLE_NAME = 'large_records';
const SEQUENCE_NAME = `${TABLE_NAME}_id_seq`;
const BATCH_SIZE = 1000; // Number of records to insert per batch
const TOTAL_RECORDS = 1000000; // Target number of records

// --- Dependency Loading ---
const DatabaseAdmin = require('../DatabaseAdmin');
const Database = require('../Database');
const DatabaseError = require('../DatabaseError');

const logging = require('dxp3-logging');
const UUID = require('dxp3-uuid');
const util = require('dxp3-util'); // Required internally by dxp3-db
const sql = require('dxp3-lang-sql'); // Required internally by dxp3-db

// --- Logging Setup ---
logging.setLevel(logging.Level.INFO); // Set desired log level (e.g., INFO, DEBUG, TRACE)
const logger = logging.getLogger('createLargeDB');

// --- Main Function ---
async function createAndPopulateDatabase() {
    let database = null;
    try {
        logger.info(`Ensuring database folder exists: ${DB_FOLDER}`);
        // Use DatabaseAdmin to handle folder creation and initialization
        // The second argument 'true' creates the folder if it doesn't exist.
        await DatabaseAdmin.setSourceFolder(DB_FOLDER, true);
        logger.info(`Database folder set to: ${DatabaseAdmin.getSourceFolder()}`);

        logger.info(`Checking for existing database '${DB_NAME}'...`);
        if (await DatabaseAdmin.exists(DB_NAME)) {
            logger.warn(`Database '${DB_NAME}' already exists. Connecting to existing database.`);
            database = await DatabaseAdmin.connect(DB_NAME);
        } else {
            logger.info(`Creating database '${DB_NAME}'...`);
            database = await DatabaseAdmin.create(DB_NAME);
            logger.info(`Database '${DB_NAME}' created successfully.`);
        }

        // Ensure database connection is initialized
        await database.init();
        logger.info(`Connected to database '${database.getName()}'.`);

        // --- Define Table Structure ---
        const columns = [
            { name: 'id', dataType: 'INTEGER' }, // Primary identifier from sequence
            { name: 'unique_guid', dataType: 'STRING', length: 36 }, // Ensures overall record uniqueness
            { name: 'status_code', dataType: 'STRING', length: 10 }, // Column for duplicate values
            { name: 'category_id', dataType: 'INTEGER' }, // Column for duplicate values
            { name: 'random_value', dataType: 'DOUBLE' }, // Random numeric value
            { name: 'event_time', dataType: 'DATE' } // Timestamp, rounded to create duplicates
        ];

        // --- Create Sequence (if it doesn't exist) ---
        if (!(await database.hasSequence(SEQUENCE_NAME))) {
             logger.info(`Creating sequence '${SEQUENCE_NAME}'...`);
             await database.createSequence(SEQUENCE_NAME);
             logger.info(`Sequence '${SEQUENCE_NAME}' created.`);
        } else {
             logger.info(`Sequence '${SEQUENCE_NAME}' already exists.`);
        }

        // --- Create Table (if it doesn't exist) ---
        if (!(await database.hasTable(TABLE_NAME))) {
            logger.info(`Creating table '${TABLE_NAME}'...`);
            await database.createTable(TABLE_NAME, columns);
            logger.info(`Table '${TABLE_NAME}' created successfully.`);

            // // Optional: Create indexes after table creation for better query performance later
            // logger.info(`Creating index on 'category_id'...`);
            // await database.createIndex(`idx_${TABLE_NAME}_category`, TABLE_NAME, 'category_id');
            // logger.info(`Index on 'category_id' created.`);
            // logger.info(`Creating index on 'status_code'...`);
            // await database.createIndex(`idx_${TABLE_NAME}_status`, TABLE_NAME, 'status_code');
            // logger.info(`Index on 'status_code' created.`);
        } else {
            logger.warn(`Table '${TABLE_NAME}' already exists. Skipping creation.`);
        }

        // --- Data Insertion ---
        const initialCount = await database.count(TABLE_NAME);
        logger.info(`Table '${TABLE_NAME}' currently contains ${initialCount} records.`);

        if (initialCount >= TOTAL_RECORDS) {
             logger.info(`Table already has ${initialCount} records (target: ${TOTAL_RECORDS}). No new records will be inserted.`);
             return; // Exit if already populated
        }

        const recordsToInsert = TOTAL_RECORDS - initialCount;
        logger.info(`Starting insertion of ${recordsToInsert} new records in batches of ${BATCH_SIZE}...`);

        const possibleStatuses = ['NEW', 'PROCESSING', 'COMPLETE', 'ERROR', 'PENDING'];
        let recordsBatch = [];
        let insertedCount = 0;
        const startTime = Date.now();
        const overallStartTime = Date.now(); // Keep track of overall start time

        for (let i = 0; i < recordsToInsert; i++) {
            const recordId = await database.nextValue(SEQUENCE_NAME); // Get next ID from sequence

            // Generate data for the record
            const record = {
                id: recordId,
                unique_guid: UUID.new(), // Globally unique identifier for the record
                status_code: possibleStatuses[i % possibleStatuses.length], // Cycle through statuses (creates duplicates)
                category_id: Math.floor(i / 100) % 50, // Assign categories 0-49 (creates duplicates)
                random_value: Math.random() * 10000,
                // Round timestamp to the nearest minute to create duplicates
                event_time: new Date(Math.floor(Date.now() / 60000) * 60000 - (i * 10000)) // Offset time slightly
            };
            recordsBatch.push(record);

            // Insert when batch is full or it's the last record
            if (recordsBatch.length === BATCH_SIZE || i === recordsToInsert - 1) {
                 const batchStartTime = Date.now(); // <<<--- Start timing the batch insert
               try {
                    const currentBatchSize = recordsBatch.length; // Store size before insert call
                    const insertResult = await database.insertMany(TABLE_NAME, recordsBatch);
                    const batchEndTime = Date.now(); // <<<--- End timing the batch insert
                    const batchDurationMs = batchEndTime - batchStartTime; // <<<--- Calculate duration in ms

                    if (insertResult && insertResult.nInserted > 0) {
                        insertedCount += insertResult.nInserted;
                        const progress = ((initialCount + insertedCount) / TOTAL_RECORDS * 100).toFixed(1);
                        const avgTimePerRecordMs = (batchDurationMs / insertResult.nInserted).toFixed(2);

                        logger.info(`Inserted batch ${Math.ceil((initialCount + insertedCount) / BATCH_SIZE)}/${Math.ceil(TOTAL_RECORDS / BATCH_SIZE)} ` +
                                    `(${insertResult.nInserted} records in ${batchDurationMs} ms, avg ${avgTimePerRecordMs} ms/record). ` +
                                    `Total in DB: ${initialCount + insertedCount} (${progress}%)`);
                    } else if (insertResult && insertResult.nInserted === 0) {
                        logger.warn(`Batch insertion reported 0 records inserted (took ${batchDurationMs} ms).`);
                    } else {
                        logger.warn(`Batch insertion did not return expected result (took ${batchDurationMs} ms).`);
                    }
                    recordsBatch = []; // Clear the batch
                } catch (insertError) {
                    logger.error(`Error inserting batch: ${insertError}`);
                    // Optional: Add more robust error handling (e.g., retry, log failed batch)
                    recordsBatch = []; // Clear the batch to avoid retrying easily
                }
            }
        }

        const endTime = Date.now();
        const durationSeconds = ((endTime - startTime) / 1000).toFixed(2);
        logger.info(`Finished inserting records. ${insertedCount} new records added in ${durationSeconds} seconds.`);

        // --- Verification ---
        const finalCount = await database.count(TABLE_NAME);
        logger.info(`Final record count in '${TABLE_NAME}': ${finalCount}`);
        if (finalCount === TOTAL_RECORDS) {
            logger.info("Successfully reached target record count.");
        } else {
            logger.warn(`Target record count (${TOTAL_RECORDS}) not met. Final count: ${finalCount}`);
        }

    } catch (error) {
        logger.error(`An error occurred during database creation/population: ${error}`);
        if (error instanceof DatabaseError) {
            logger.error(`DatabaseError Code: ${error.code}, Message: ${error.message}`);
        }
         console.error("Stack Trace:", error.stack); // Log stack trace for detailed debugging
    } finally {
        if (database) {
            try {
                logger.info(`Closing database connection to '${DB_NAME}'...`);
                await database.close();
                logger.info('Database connection closed.');
            } catch (closeError) {
                logger.error(`Error closing database: ${closeError}`);
            }
        }
    }
}

// --- Run the main function ---
(async () => {
    await createAndPopulateDatabase();
})();
