import pandas as pd
import numpy as np
import json
import os
import traceback

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
    try:
        print("Creating league-country mapping...")
        
        # Ensure data directory exists
        os.makedirs('data', exist_ok=True)
        
        leagues_df = pd.DataFrame({
            'league_name': list(LEAGUE_COUNTRY_MAPPING.keys()),
            'country': list(LEAGUE_COUNTRY_MAPPING.values())
        })
        
        # Save to CSV
        output_path = os.path.join('data', 'league_countries.csv')
        leagues_df.to_csv(output_path, index=False)
        print(f"Created league_countries.csv with {len(leagues_df)} leagues at {output_path}")
        
        # Verify the file was created
        if os.path.exists(output_path):
            print(f"Verified file exists: {output_path}")
        else:
            print(f"WARNING: File was not created: {output_path}")
        
        return leagues_df
    except Exception as e:
        print(f"Error creating league country mapping: {e}")
        print(traceback.format_exc())
        # Return empty DataFrame to allow processing to continue
        return pd.DataFrame(columns=['league_name', 'country'])

def create_club_averages(fifa_data):
    """Create aggregated stats for each club"""
    try:
        print("Creating club averages...")
        
        # Check if fifa_data is valid
        if fifa_data.empty:
            print("WARNING: fifa_data is empty, cannot create club averages")
            return pd.DataFrame()
        
        # Make sure required columns exist
        required_cols = ['club_name', 'league_name', 'player_id']
        player_attrs = ['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physic', 
                        'player_overall', 'potential', 'value_millions_eur', 'wage_thousands_eur']
        
        missing_cols = [col for col in required_cols + player_attrs if col not in fifa_data.columns]
        if missing_cols:
            print(f"WARNING: Missing columns in fifa_data: {missing_cols}")
            print(f"Available columns: {fifa_data.columns.tolist()}")
            # Create dummy data if necessary
            for col in missing_cols:
                if col in player_attrs:
                    print(f"Creating dummy column for {col}")
                    fifa_data[col] = 50.0  # Default value for missing attributes
        
        # Select relevant columns for aggregation
        columns_to_use = ['club_name', 'league_name'] + [col for col in player_attrs if col in fifa_data.columns] + ['player_id']
        fifa_data_subset = fifa_data[columns_to_use].copy()
        
        # Group by club and calculate averages
        # Use a try-except for each attribute to handle any errors
        agg_dict = {}
        for attr in player_attrs:
            if attr in fifa_data_subset.columns:
                agg_dict[attr] = 'mean'
        
        # Add player count
        agg_dict['player_id'] = 'count'
        
        # Perform aggregation
        club_stats = fifa_data_subset.groupby(['club_name', 'league_name']).agg(agg_dict).reset_index()
        
        