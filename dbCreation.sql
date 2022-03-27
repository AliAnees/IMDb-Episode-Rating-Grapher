IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'imdbData')
BEGIN
    CREATE DATABASE imdbData;
END;
GO

use imdbData

DROP TABLE IF EXISTS basics
DROP TABLE IF EXISTS episode
DROP TABLE IF EXISTS ratings
DROP TABLE IF EXISTS compiledEps
DROP TABLE IF EXISTS compiledShows

--Creating tables and importing from files

create TABLE basics(
    id varchar(255),
    titleType varchar(255),
    primaryTitle nvarchar(455),
    origTitle nvarchar(455),
    isAdult varchar(255),
    startYear varchar(255),
    endYear varchar(255),
    runTime varchar(255),
    genres varchar(255)
)

BULK INSERT basics
FROM '$(path)\Database\basics.tsv'
WITH
(
    CODEPAGE = '65001',
    FIRSTROW = 2,
    FIELDTERMINATOR = '\t',
    ROWTERMINATOR = '0x0a',
    TABLOCK
)

create TABLE episode (
    epID varchar(255),
    showID varchar(255),
    sznNbr varchar(255),
    epNbr varchar(255)
)

BULK INSERT episode
FROM '$(path)\Database\episode.tsv'
WITH
(
    CODEPAGE = '65001',
    FIRSTROW = 2,
    FIELDTERMINATOR = '\t',
    ROWTERMINATOR = '0x0a',
    TABLOCK
)

create TABLE ratings (
    id varchar(255),
    rating varchar(255),
    votes varchar(255)
)

BULK INSERT ratings
FROM '$(path)\Database\ratings.tsv'
WITH
(
    CODEPAGE = '65001',
    FIRSTROW = 2,
    FIELDTERMINATOR = '\t',
    ROWTERMINATOR = '0x0a',
    TABLOCK
)

-------------------

--Removing unnecessary columns
ALTER TABLE basics DROP COLUMN origTitle, isAdult, endYear, runTime;

--Removing unneeded entries
DELETE FROM basics WHERE (titleType != 'tvEpisode') AND (titleType != 'tvSeries') AND (titleType != 'tvMiniSeries');
DELETE FROM episode WHERE (epNbr = '\N') OR (sznNbr = '\N')

--Converting numbers to appropriate data type
ALTER TABLE episode ALTER COLUMN sznNbr int;
ALTER TABLE episode ALTER COLUMN epNbr int;
ALTER TABLE ratings ALTER COLUMN rating float;
ALTER TABLE ratings ALTER COLUMN votes int;

--Creating compilation of episodes
SELECT
    episode.showID,
    basics.primaryTitle AS episodeTitle, 
    episode.sznNbr,
    episode.epNbr,
    ratings.rating,
    ratings.votes,
    episode.epID
INTO compiledEps
FROM episode
    INNER JOIN basics 
        ON episode.epID = basics.id
    INNER JOIN ratings 
        ON episode.epID = ratings.id;

--Creating compilation of tv shows
SELECT
    basics.primaryTitle as showTitle,
    basics.startYear,
    basics.genres,
    ratings.rating,
    ratings.votes,
    basics.id AS showID
INTO compiledShows
FROM basics
    INNER JOIN ratings 
        ON basics.id = ratings.id
            WHERE basics.titleType != 'tvEpisode';
