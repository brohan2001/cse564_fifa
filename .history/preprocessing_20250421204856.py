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
        
        # Rename columns for clarity
        club_stats.rename(columns={'player_id': 'num_players'}, inplace=True)
        
        # Add league country information
        try:
            league_country_df = pd.read_csv('data/league_countries.csv')
            club_stats = club_stats.merge(league_country_df, on='league_name', how='left')
            
            # Check for clubs without country information
            missing_country = club_stats[club_stats['country'].isna()]
            if len(missing_country) > 0:
                print(f"WARNING: {len(missing_country)} clubs have no country information")
                print(f"First few examples: {missing_country['club_name'].head().tolist()}")
                
                # Fill missing countries with a placeholder
                club_stats['country'] = club_stats['country'].fillna('Unknown')
        except Exception as e:
            print(f"Error merging league country data: {e}")
            print(traceback.format_exc())
            # Add country column if missing
            if 'country' not in club_stats.columns:
                club_stats['country'] = 'Unknown'
        
        # Save to CSV
        output_path = os.path.join('data', 'club_averages.csv')
        club_stats.to_csv(output_path, index=False)
        print(f"Created club_averages.csv with {len(club_stats)} clubs at {output_path}")
        
        # Verify the file was created
        if os.path.exists(output_path):
            print(f"Verified file exists: {output_path}")
        else:
            print(f"WARNING: File was not created: {output_path}")
        
        return club_stats
    except Exception as e:
        print(f"Error creating club averages: {e}")
        print(traceback.format_exc())
        # Return empty DataFrame to allow processing to continue
        return pd.DataFrame(columns=['club_name', 'league_name', 'country', 'num_players'])

def process_data_for_visualizations():
    """Process FIFA data for all visualizations"""
    try:
        print("Starting data processing for visualizations...")
        
        # Ensure data directory exists
        os.makedirs('data', exist_ok=True)
        
        # Load original FIFA data
        fifa_csv_path = os.path.join('data', 'excel.csv')
        if not os.path.exists(fifa_csv_path):
            print(f"ERROR: FIFA data file not found at {fifa_csv_path}")
            print(f"Current directory: {os.getcwd()}")
            print(f"Files in data directory: {os.listdir('data') if os.path.exists('data') else 'data directory not found'}")
            raise FileNotFoundError(f"FIFA data file not found at {fifa_csv_path}")
        
        print(f"Loading FIFA data from {fifa_csv_path}")
        fifa_data = pd.read_csv(fifa_csv_path)
        print(f"Loaded FIFA data with {len(fifa_data)} players and {len(fifa_data.columns)} columns")
        print(f"Columns: {fifa_data.columns.tolist()}")
        
        # Check for required columns
        required_cols = ['player_id', 'short_name', 'player_overall', 'club_name', 'league_name']
        missing_cols = [col for col in required_cols if col not in fifa_data.columns]
        if missing_cols:
            print(f"ERROR: Missing required columns in FIFA data: {missing_cols}")
            raise ValueError(f"Missing required columns: {missing_cols}")
            
        # Create league to country mapping
        league_country_df = create_league_country_mapping()
        
        # Add country information to player data
        fifa_data = fifa_data.merge(league_country_df, on='league_name', how='left')
        
        # Check for players without country information
        missing_country = fifa_data[fifa_data['country'].isna()]
        if len(missing_country) > 0:
            print(f"WARNING: {len(missing_country)} players have no country information")
            print(f"Leagues without country mapping: {missing_country['league_name'].unique().tolist()}")
            
            # Fill missing countries with 'Unknown'
            fifa_data['country'] = fifa_data['country'].fillna('Unknown')
        
        # Save processed FIFA data
        output_path = os.path.join('data', 'fifa_processed.csv')
        fifa_data.to_csv(output_path, index=False)
        print(f"Created fifa_processed.csv with {len(fifa_data)} players at {output_path}")
        
        # Verify the file was created
        if os.path.exists(output_path):
            print(f"Verified file exists: {output_path}")
        else:
            print(f"WARNING: File was not created: {output_path}")
        
        # Create club-level aggregated statistics
        club_stats = create_club_averages(fifa_data)
        
        # Create country-level statistics for the world map
        try:
            print("Creating country statistics...")
            
            # Make sure 'country' column exists
            if 'country' not in fifa_data.columns:
                print("ERROR: 'country' column not found in fifa_data")
                raise ValueError("'country' column not found in fifa_data")
            
            # Group by country and calculate statistics
            country_stats = fifa_data.groupby('country').agg({
                'player_id': 'count',
                'player_overall': 'mean',
                'value_millions_eur': 'mean'
            }).reset_index()
            
            # Handle NaN values in aggregated columns
            country_stats['player_overall'] = country_stats['player_overall'].fillna(0)
            country_stats['value_millions_eur'] = country_stats['value_millions_eur'].fillna(0)
            
            # Rename columns for clarity
            country_stats.rename(columns={
                'player_id': 'num_players',
                'player_overall': 'avg_overall',
                'value_millions_eur': 'avg_value'
            }, inplace=True)
            
            # Save to CSV
            output_path = os.path.join('data', 'country_stats.csv')
            country_stats.to_csv(output_path, index=False)
            print(f"Created country_stats.csv with {len(country_stats)} countries at {output_path}")
            
            # Verify the file was created
            if os.path.exists(output_path):
                print(f"Verified file exists: {output_path}")
            else:
                print(f"WARNING: File was not created: {output_path}")
        except Exception as e:
            print(f"Error creating country statistics: {e}")
            print(traceback.format_exc())
            country_stats = pd.DataFrame(columns=['country', 'num_players', 'avg_overall', 'avg_value'])
            # Still save the empty DataFrame to prevent errors
            country_stats.to_csv(os.path.join('data', 'country_stats.csv'), index=False)

        # Summary of created files
        print(f"Files created in data directory:")
        for filename in os.listdir('data'):
            file_path = os.path.join('data', filename)
            if os.path.isfile(file_path):
                file_size = os.path.getsize(file_path)
                print(f" - {filename} ({file_size} bytes)")
                
                # Additional verification for each file
                if file_size == 0:
                    print(f"   WARNING: File {filename} is empty (0 bytes)")
                    
                # Check CSV files for content
                if filename.endswith('.csv'):
                    try:
                        df = pd.read_csv(file_path)
                        print(f"   Verified: {len(df)} rows, {len(df.columns)} columns")
                    except Exception as file_error:
                        print(f"   ERROR reading {filename}: {file_error}")
        
        return {
            'fifa_data': fifa_data,
            'club_stats': club_stats,
            'country_stats': country_stats
        }
    except Exception as e:
        print(f"Error in process_data_for_visualizations: {e}")
        print(traceback.format_exc())
        # Create minimal empty files to prevent errors in the web app
        create_empty_files()
        return None

def create_empty_files():
    """Create empty files with proper columns to prevent errors in the web app"""
    try:
        print("Creating empty files with proper structure...")
        
        # Create empty fifa_processed.csv
        pd.DataFrame(columns=[
            'short_name', 'long_name', 'player_id', 'player_overall', 'potential', 'age',
            'height_cm', 'weight_kg', 'value_millions_eur', 'wage_thousands_eur',
            'pace', 'shooting', 'passing', 'dribbling', 'defending', 'physic',
            'player_positions', 'preferred_foot', 'nationality_name', 'league_name',
            'skill_moves', 'weak_foot', 'international_reputation', 'club_name',
            'team_overall', 'domestic_prestige', 'def_style', 'off_chance_creation',
            'overall15', 'value_millions_eur15', 'country'
        ]).to_csv(os.path.join('data', 'fifa_processed.csv'), index=False)
        
        # Create empty club_averages.csv
        pd.DataFrame(columns=[
            'club_name', 'league_name', 'pace', 'shooting', 'passing', 'dribbling', 
            'defending', 'physic', 'player_overall', 'potential', 'value_millions_eur', 
            'wage_thousands_eur', 'num_players', 'country'
        ]).to_csv(os.path.join('data', 'club_averages.csv'), index=False)
        
        # Create empty country_stats.csv
        pd.DataFrame(columns=[
            'country', 'num_players', 'avg_overall', 'avg_value'
        ]).to_csv(os.path.join('data', 'country_stats.csv'), index=False)
        
        # Create empty league_countries.csv
        pd.DataFrame(columns=[
            'league_name', 'country'
        ]).to_csv(os.path.join('data', 'league_countries.csv'), index=False)
        
        print("Created empty files with proper columns")
    except Exception as e:
        print(f"Error creating empty files: {e}")
        print(traceback.format_exc())

if __name__ == "__main__":
    print("Running preprocessing.py")
    result = process_data_for_visualizations()
    if result:
        print("Preprocessing completed successfully")
    else:
        print("Preprocessing failed, check logs for errors")