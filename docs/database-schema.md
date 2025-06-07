# PS-Olympics Database Schema Design

## Core Tables

### sports

```sql
CREATE TABLE sports (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon_url VARCHAR(255),
    type ENUM('INDIVIDUAL', 'TEAM', 'BOTH') NOT NULL,
    max_players_per_team INT,
    scoring_type ENUM('POINTS', 'TIME', 'ROUNDS', 'GOALS') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sports_type ON sports(type);
```

### teams

```sql
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    logo_url VARCHAR(255),
    gold_medals INT DEFAULT 0,
    silver_medals INT DEFAULT 0,
    bronze_medals INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, country)
);

CREATE INDEX idx_teams_medals ON teams(gold_medals, silver_medals, bronze_medals);
```

### athletes

```sql
CREATE TABLE athletes (
    id SERIAL PRIMARY KEY,
    team_id INT REFERENCES teams(id),
    name VARCHAR(100) NOT NULL,
    photo_url VARCHAR(255),
    date_of_birth DATE NOT NULL,
    gender ENUM('M', 'F', 'OTHER') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_athletes_team ON athletes(team_id);
```

## Tournament Structure

### tournaments

```sql
CREATE TABLE tournaments (
    id SERIAL PRIMARY KEY,
    sport_id INT REFERENCES sports(id),
    name VARCHAR(100) NOT NULL,
    format ENUM('KNOCKOUT', 'LEAGUE', 'ROUND_ROBIN') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('UPCOMING', 'IN_PROGRESS', 'COMPLETED') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tournaments_sport ON tournaments(sport_id);
CREATE INDEX idx_tournaments_dates ON tournaments(start_date, end_date);
```

### matches

```sql
CREATE TABLE matches (
    id SERIAL PRIMARY KEY,
    tournament_id INT REFERENCES tournaments(id),
    venue VARCHAR(100) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    status ENUM('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL,
    round VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_matches_tournament ON matches(tournament_id);
CREATE INDEX idx_matches_timing ON matches(start_time, end_time);
```

### match_participants

```sql
CREATE TABLE match_participants (
    id SERIAL PRIMARY KEY,
    match_id INT REFERENCES matches(id),
    team_id INT REFERENCES teams(id),
    athlete_id INT REFERENCES athletes(id),
    score DECIMAL(10,2),
    result ENUM('WIN', 'LOSS', 'DRAW', 'DNF') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (team_id IS NOT NULL OR athlete_id IS NOT NULL)
);

CREATE INDEX idx_match_participants_match ON match_participants(match_id);
CREATE INDEX idx_match_participants_team ON match_participants(team_id);
CREATE INDEX idx_match_participants_athlete ON match_participants(athlete_id);
```

## Sport-Specific Tables

### cricket_scores

```sql
CREATE TABLE cricket_scores (
    id SERIAL PRIMARY KEY,
    match_id INT REFERENCES matches(id),
    team_id INT REFERENCES teams(id),
    innings INT NOT NULL,
    runs INT NOT NULL DEFAULT 0,
    wickets INT NOT NULL DEFAULT 0,
    overs DECIMAL(4,1) NOT NULL DEFAULT 0,
    extras INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cricket_scores_match ON cricket_scores(match_id);
```

### football_scores

```sql
CREATE TABLE football_scores (
    id SERIAL PRIMARY KEY,
    match_id INT REFERENCES matches(id),
    team_id INT REFERENCES teams(id),
    goals INT NOT NULL DEFAULT 0,
    shots_on_target INT NOT NULL DEFAULT 0,
    possession DECIMAL(4,1),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_football_scores_match ON football_scores(match_id);
```

### basketball_scores

```sql
CREATE TABLE basketball_scores (
    id SERIAL PRIMARY KEY,
    match_id INT REFERENCES matches(id),
    team_id INT REFERENCES teams(id),
    quarter INT NOT NULL,
    points INT NOT NULL DEFAULT 0,
    fouls INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_basketball_scores_match ON basketball_scores(match_id);
```

### racquet_sport_scores

```sql
CREATE TABLE racquet_sport_scores (
    id SERIAL PRIMARY KEY,
    match_id INT REFERENCES matches(id),
    participant_id INT REFERENCES match_participants(id),
    set_number INT NOT NULL,
    points INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_racquet_scores_match ON racquet_sport_scores(match_id);
```

### chess_matches

```sql
CREATE TABLE chess_matches (
    id SERIAL PRIMARY KEY,
    match_id INT REFERENCES matches(id),
    white_player_id INT REFERENCES athletes(id),
    black_player_id INT REFERENCES athletes(id),
    result ENUM('WHITE_WIN', 'BLACK_WIN', 'DRAW'),
    moves_count INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chess_matches_match ON chess_matches(match_id);
```

### carrom_matches

```sql
CREATE TABLE carrom_matches (
    id SERIAL PRIMARY KEY,
    match_id INT REFERENCES matches(id),
    participant_id INT REFERENCES match_participants(id),
    whites_pocketed INT NOT NULL DEFAULT 0,
    blacks_pocketed INT NOT NULL DEFAULT 0,
    queens_pocketed INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_carrom_matches_match ON carrom_matches(match_id);
```

### foosball_scores

```sql
CREATE TABLE foosball_scores (
    id SERIAL PRIMARY KEY,
    match_id INT REFERENCES matches(id),
    team_id INT REFERENCES teams(id),
    goals INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_foosball_scores_match ON foosball_scores(match_id);
```

### lemon_spoon_race

```sql
CREATE TABLE lemon_spoon_race (
    id SERIAL PRIMARY KEY,
    match_id INT REFERENCES matches(id),
    athlete_id INT REFERENCES athletes(id),
    finish_time DECIMAL(8,2),
    drops_count INT NOT NULL DEFAULT 0,
    disqualified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lemon_spoon_match ON lemon_spoon_race(match_id);
```

## Views

### medal_standings

```sql
CREATE VIEW medal_standings AS
SELECT
    t.id,
    t.name,
    t.country,
    t.gold_medals,
    t.silver_medals,
    t.bronze_medals,
    (t.gold_medals * 3 + t.silver_medals * 2 + t.bronze_medals) as total_points
FROM teams t
ORDER BY total_points DESC;
```

### upcoming_matches

```sql
CREATE VIEW upcoming_matches AS
SELECT
    m.id,
    s.name as sport,
    m.venue,
    m.start_time,
    m.round,
    t.name as tournament
FROM matches m
JOIN tournaments t ON m.tournament_id = t.id
JOIN sports s ON t.sport_id = s.id
WHERE m.start_time > CURRENT_TIMESTAMP
AND m.status = 'SCHEDULED'
ORDER BY m.start_time;
```

## Indexes and Constraints

### Compound Indexes

```sql
-- For efficient schedule queries
CREATE INDEX idx_matches_schedule ON matches(status, start_time);

-- For medal queries
CREATE INDEX idx_teams_medals_combined ON teams(gold_medals DESC, silver_medals DESC, bronze_medals DESC);

-- For tournament progress
CREATE INDEX idx_tournaments_status_dates ON tournaments(status, start_date, end_date);
```

### Foreign Key Constraints

All foreign key relationships include:

- ON DELETE RESTRICT (prevent deletion of referenced records)
- ON UPDATE CASCADE (update references when primary key changes)

### Check Constraints

```sql
-- Ensure valid medal counts
ALTER TABLE teams ADD CONSTRAINT valid_medals
    CHECK (gold_medals >= 0 AND silver_medals >= 0 AND bronze_medals >= 0);

-- Ensure valid match times
ALTER TABLE matches ADD CONSTRAINT valid_match_times
    CHECK (end_time IS NULL OR end_time > start_time);

-- Ensure valid tournament dates
ALTER TABLE tournaments ADD CONSTRAINT valid_tournament_dates
    CHECK (end_date >= start_date);
```
