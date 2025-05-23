/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-db
 *
 * NAME
 * ResultSet
 */
const packageName = 'dxp3-db';
const moduleName = 'ResultSet';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print();
    return;
}
/**
 * @module dxp3-db/ResultSet
 */
const DatabaseError = require('./DatabaseError');
const sql = require('dxp3-lang-sql');

const DEFAULT_PAGE_SIZE = 100;

class ResultSet extends sql.SQLResultSet {
    /**
     * @param {Array<Object>} results - The array of records.
     * @param {number} [pageSize=0] - The number of rows per page. If 0 or less, pagination is disabled.
     */
    constructor(_results = [], pageSize = DEFAULT_PAGE_SIZE) {
        super();
        this._allResults = Array.isArray(_results) ? _results : [];
        this._cursor = -1; // Positioned before the first row of the current page

        this._pageSize = parseInt(pageSize, 10);
        this._isPaginated = this._pageSize > 0 && this._allResults.length > 0 && this._pageSize < this._allResults.length;

        this._currentPage = 0;
        this._totalPages = 0;
        this._currentPageResults = [];
        if (this._isPaginated) {
            this._totalPages = Math.ceil(this._allResults.length / this._pageSize);
            this._currentPage = 0; // Start at the first page
            this._loadPage();
        } else {
            this._currentPageResults = [...this._allResults]; // All results are the "current page"
            this._totalPages = this._allResults.length > 0 ? 1 : 0;
            this._currentPage = 0;
        }
    }

    /**
     * Loads the data for the current page into _currentPageResults.
     * Resets the cursor.
     * @private
     */
    _loadPage() {
        if (!this._isPaginated) {
            // If not paginated, _currentPageResults already holds all results or is empty
            if (this._allResults.length > 0 && this._currentPageResults.length === 0) {
                 this._currentPageResults = [...this._allResults];
            }
            // Cursor should be reset if page context changes, but here it's one "page"
            // this._cursor = -1; // Let's keep cursor consistent unless explicitly moved
            return;
        }

        if (this._currentPage < 0 || this._currentPage >= this._totalPages) {
            this._currentPageResults = []; // Invalid page
        } else {
            const start = this._currentPage * this._pageSize;
            const end = start + this._pageSize;
            this._currentPageResults = this._allResults.slice(start, end);
        }
        this._cursor = -1; // Reset cursor when page changes
    }

    /**
     * Returns the current row from the current page.
     * @returns {Object|null} The current row object, or null if cursor is not on a valid row.
     */
    getRow() {
        if (this._cursor >= 0 && this._cursor < this._currentPageResults.length) {
            return this._currentPageResults[this._cursor];
        }
        return null;
    }

    /**
     * Returns an array of rows currently present in the resultset (i.e., the current page).
     * If the resultset consists of more pages, one will
     * have to check if there are more rows to fetch
     * by calling hasMorePages() and then toNextPage().
     * @returns {Array<Object>} An array of row objects for the current page.
     */
    getRows() {
        return [...this._currentPageResults]; // Return a copy
    }

    /**
     * Moves cursor to the first row of the current page.
     * @returns {boolean} True if there is a first row on the current page, false otherwise.
     */
    toFirstRow() {
        if (this._currentPageResults.length > 0) {
            this._cursor = 0;
            return true;
        }
        this._cursor = -1; // Ensure cursor is reset if no rows
        return false;
    }

    /**
     * Moves cursor to the last row of the current page.
     * @returns {boolean} True if there is a last row on the current page, false otherwise.
     */
    toLastRow() {
        if (this._currentPageResults.length > 0) {
            this._cursor = this._currentPageResults.length - 1;
            return true;
        }
        this._cursor = -1; // Ensure cursor is reset if no rows
        return false;
    }

    /**
     * Moves cursor forward within the current page.
     * @returns {boolean} True if there was a next row on the current page, false otherwise.
     */
    toNextRow() {
        if (this._cursor < this._currentPageResults.length - 1) {
            this._cursor++;
            return true;
        }
        // If already at or past the last row of the current page
        return false;
    }

    /**
     * Moves cursor to the previous row within the current page.
     * @returns {boolean} True if there is a previous row on the current page, false otherwise.
     */
    toPreviousRow() {
        if (this._cursor > 0) {
            this._cursor--;
            return true;
        }
        // If at the first row or before it
        return false;
    }

    /**
     * Closes the result set and releases any resources.
     * For this in-memory implementation, it clears the stored results.
     * @returns {Promise<void>}
     */
    async close() {
        this._allResults = [];
        this._currentPageResults = [];
        this._cursor = -1;
        this._currentPage = 0;
        this._totalPages = 0;
        this._isPaginated = false;
        this._pageSize = 0;
        // No actual async operations for this in-memory version
        return Promise.resolve();
    }

    /**
     * Checks if there are more pages of results.
     * @returns {boolean} True if pagination is enabled and there's a next page, false otherwise.
     */
    hasMorePages() {
        if (!this._isPaginated) {
            return false;
        }
        return this._currentPage < this._totalPages - 1;
    }

    /**
     * Checks if there are more rows after the current cursor position on the current page.
     * @returns {boolean} True if there are more rows on the current page, false otherwise.
     */
    hasMoreRows() {
        return this._cursor < this._currentPageResults.length - 1;
    }

    /**
     * Moves to the next page of results if pagination is enabled.
     * @returns {Promise<boolean>} True if successfully moved to a next page and that page has rows, false otherwise.
     */
    async toNextPage() {
        if (!this._isPaginated || !this.hasMorePages()) {
            return Promise.resolve(false);
        }
        this._currentPage++;
        this._loadPage();
        // Returns true if the new page has content, false otherwise
        return Promise.resolve(this._currentPageResults.length > 0);
    }

    // --- Optional helper methods for pagination ---

    /**
     * Gets the current page number (0-indexed).
     * @returns {number} The current page number.
     */
    getCurrentPageNumber() {
        return this._currentPage;
    }

    /**
     * Gets the total number of pages.
     * @returns {number} The total number of pages.
     */
    getTotalPages() {
        return this._totalPages;
    }

    /**
     * Gets the configured page size.
     * @returns {number} The page size (0 if pagination is disabled).
     */
    getPageSize() {
        return this._isPaginated ? this._pageSize : 0;
    }

    /**
     * Gets the total number of records in the entire result set (across all pages).
     * @returns {number} The total number of records.
     */
    getTotalNumberOfRows() {
        return this._allResults.length;
    }

    /**
     * Moves to a specific page number (0-indexed) if pagination is enabled.
     * @param {number} pageNumber - The page number to move to.
     * @returns {Promise<boolean>} True if successfully moved to the specified page and it has rows, false otherwise.
     */
    async goToPage(pageNumber) {
        if (!this._isPaginated || pageNumber < 0 || pageNumber >= this._totalPages) {
            return Promise.resolve(false);
        }
        this._currentPage = pageNumber;
        this._loadPage();
        return Promise.resolve(this._currentPageResults.length > 0);
    }
}

module.exports = ResultSet;