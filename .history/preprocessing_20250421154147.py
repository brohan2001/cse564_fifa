import pandas as pd
import numpy as np
import json

# Dictionary mapping leagues to their countries
# This needs to be created manually as FIFA doesn't provide direct mapping
LEAGUE_COUNTRY_MAPPING = {
    'Premier League': 'England',
    'La Liga': 'Spain',
    'Serie A': 'Italy',
    'Bundesliga': 'Germany',
    'Ligue 1': 'France',
    'Eredivisie': 'Netherlands',
    'Liga Portugal': 'Portugal',
    'Super Lig': 'Turkey',
    'Saudi Pro League': 'Saudi Arabia',
    'Primera División': 'Argentina',
    'Campeonato Brasileiro Série A': 'Brazil',
    'MLS': 'United States',
    'Belgian Pro League': 'Belgium',
    'Scottish Premiership': 'Scotland',
    'Russian Premier League': 'Russia',
    'Super League': 'Switzerland',
    # Add more leagues as needed
}

def create_league_country_mapping():
    """Create a CSV mapping leagues to countries"""
    leagues_df = pd.DataFrame({
        'league_name': list(LEAGUE_COUNTRY_MAPPING.keys()),
        'country': list(LEAGUE_COUNTRY_MAPPING.values())
    })
    
    leagues_df.to_csv('data/league_countries.csv', index=False)
    print(f"Created league_countries.csv with {len(leagues_df)} leagues")
    
    # Also create a GeoJSON format for the visualization
    league_country_counts = {}
    
    return leagues_df

def create_club_averages(fifa_data):
    """Create aggregated stats for each club"""
    # Select relevant columns for aggregation
    player_attrs = ['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physic', 
                    'player_overall', 'potential', 'value_millions_eur', 'wage_thousands_eur']
    
    # Group by club and calculate averages
    club_stats = fifa_data.groupby(['club_name', 'league_name']).agg({
        **{attr: 'mean' for attr in player_attrs},
        'player_id': 'count'  # Count players per club
    }).reset_index()
    
    # Rename columns for clarity
    club_stats.rename(columns={'player_id': 'num_players'}, inplace=True)
    
    # Add league country information
    league_country_df = pd.read_csv('data/league_countries.csv')
    club_stats = club_stats.merge(league_country_df, on='league_name', how='left')
    
    # Save to CSV
    club_stats.to_csv('data/club_averages.csv', index=False)
    print(f"Created club_averages.csv with {len(club_stats)} clubs")
    
    return club_stats

def process_data_for_visualizations():
    """Process FIFA data for all visualizations"""
    # Load original FIFA data
    fifa_data = pd.read_csv('data/excel.csv')
    
    # Create league to country mapping
    league_country_df = create_league_country_mapping()
    
    # Add country information to player data
    fifa_data = fifa_data.merge(league_country_df, on='league_name', how='left')
    fifa_data.to_csv('data/fifa_processed.csv', index=False)
    
    # Create club-level aggregated statistics
    club_stats = create_club_averages(fifa_data)
    
    # Create country-level statistics for the world map
    country_stats = fifa_data.groupby('country').agg({
        'player_id': 'count',
        'player_overall': 'mean',
        'value_millions_eur': 'mean'
    }).reset_index()
    
    country_stats.rename(columns={
        'player_id': 'num_players',
        'player_overall': 'avg_overall',
        'value_millions_eur': 'avg_value'
    }, inplace=True)
    
    country_stats.to_csv('data/country_stats.csv', index=False)
    print(f"Created country_stats.csv with {len(country_stats)} countries")
    
    return {
        'fifa_data': fifa_data,
        'club_stats': club_stats,
        'country_stats': country_stats
    }



if __name__ == "__main__":
    process_data_for_visualizations()