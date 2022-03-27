const sql = require('mssql/msnodesqlv8');
const dotenv = require('dotenv');
const { Connection } = require('tedious');
let instance = null;
dotenv.config();

let results = []

const conn = new sql.ConnectionPool({
    database: "imdbData",
    server: "localhost",
    driver: "msnodesqlv8",
    options: {
        trustedConnection: true
    }
})

conn.connect((err) => {
    if (err) {
        console.log(err.message);
    }
    //console.log('db ' + conn.state);
});

class DbService {
    static getDbServiceInstance() {
        return instance ? instance : new DbService();
    }

    async getAllShows(show){
        try {
            const response = await new Promise((resolve, reject) => {
                const startQuery = "SELECT TOP 5 * FROM compiledShows WHERE showTitle LIKE \'%" + show + "%\' ";
                const sortingQuery = `ORDER BY CASE 
                                        WHEN showTitle = \'` + show + `\' THEN 0 
                                        WHEN showTitle LIKE \'` + show + `%\' THEN 1 
                                        WHEN showTitle LIKE \'%` + show + `%\' THEN 2 
                                        WHEN showTitle LIKE \'%` + show + `\' THEN 3 ELSE 4 
                                        END, votes DESC`;

                conn.query(startQuery + sortingQuery, (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                })
            })
            return(response.recordset);
        } catch (err) {
            console.log(err);
        }
    }

    async getShowData(show){
        try {
            const response = await new Promise((resolve, reject) => {
                const query = "SELECT * FROM compiledEps WHERE showID = \'" + show + "\' ORDER BY sznNbr, epNbr";

                conn.query(query, (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                })
            })
            return(response.recordset);
        } catch (err) {
            console.log(err);
        }
    }
}

module.exports = DbService;