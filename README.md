
#-----------#


# cse564_fifa
Final Project for CSE 564 Visuallization

# FIFA Player Data Visualization

This project is an interactive dashboard for visualizing FIFA player data, creating a comprehensive visual analytics platform to explore player attributes, club statistics, and geographic distribution.

## Overview

The FIFA Player Data Visualization project provides multiple coordinated visualizations including:

- **World Map**: Shows geographic distribution of players by country
- **PCA Biplot**: Principal Component Analysis of player attributes
- **Parallel Coordinates Plot**: Compare multiple attributes across players or clubs
- **Player Profile**: Detailed radar chart and information for individual players

## Prerequisites

- Python 3.8+
- Flask
- Pandas
- NumPy
- scikit-learn
- D3.js (included)

## Installation and Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/fifa-visualization.git
cd fifa-visualization
```

2. Install dependencies
```bash
pip install flask pandas numpy scikit-learn
```

3. Run the application
```bash
python app.py
```

**Note**: The preprocessing and image generation steps (preprocessing.py and image.py) have already been run. These scripts processed the raw FIFA data and added image links for players.

4. Access the dashboard
Open your web browser and navigate to [http://localhost:5000](http://localhost:5000)

## Project Structure

### Python Files

- **app.py**: The main Flask application that serves the dashboard and API endpoints
- **preprocessing.py**: Script for data preparation and transformation (already run)
- **image.py**: Script for generating player image URLs (already run)

### Data Files

- **excel.csv**: Raw FIFA player data
- **fifa_processed.csv**: Processed player data with additional attributes
- **club_averages.csv**: Aggregated statistics for each club
- **country_stats.csv**: Country-level statistics for the world map
- **league_countries.csv**: Mapping between leagues and countries

### JavaScript Visualization Files

- **main.js**: Core functionality for the dashboard, data loading, and event handling
- **world_map.js**: Interactive map visualization showing player distribution
- **pcp.js**: Parallel Coordinates Plot for comparing multiple player attributes
- **biplot.js**: PCA visualization to explore relationships between attributes
- **player_profile.js**: Player detail view with radar chart and information

### HTML/CSS Files

- **index.html**: Main dashboard layout and structure
- **styles.css**: Styling for the dashboard components

## Features

- Filter players by league, club, and position
- Interactive visualizations with coordinated views
- Detailed player profile with radar chart of abilities
- Geographic data visualization on world map
- Dimensional reduction via PCA to explore attribute relationships
- Compare players using parallel coordinates plot

## Data Sources

The data used in this project comes from FIFA player statistics.

