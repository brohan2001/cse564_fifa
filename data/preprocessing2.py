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

def create_country_stats(fifa_data):
    """Create aggregated stats for each country, including percentage of total players."""
    try:
        print("Creating country stats...")

        if fifa_data.empty:
            print("WARNING: fifa_data is empty, cannot create country stats")
            return pd.DataFrame()

        # Use 'nationality_name' or 'country' as the country key
        country_col = 'nationality_name' if 'nationality_name' in fifa_data.columns else 'country'

        # Group by country and count players
        country_counts = fifa_data.groupby(country_col)['player_id'].count().reset_index()
        country_counts.rename(columns={'player_id': 'num_players', country_col: 'country'}, inplace=True)

        # Calculate total players
        total_players = country_counts['num_players'].sum()
        country_counts['percentage_of_players'] = (country_counts['num_players'] / total_players) * 100

        # Round for readability
        country_counts['percentage_of_players'] = country_counts['percentage_of_players'].round(2)

        # Save to CSV
        output_path = os.path.join('data', 'country_stats.csv')
        country_counts.to_csv(output_path, index=False)
        print(f"Created country_stats.csv with {len(country_counts)} countries at {output_path}")

        # Verify file creation
        if os.path.exists(output_path):
            print(f"Verified file exists: {output_path}")
        else:
            print(f"WARNING: File was not created: {output_path}")

        return country_counts

    except Exception as e:
        print(f"Error creating country stats: {e}")
        print(traceback.format_exc())
        return pd.DataFrame(columns=['country', 'num_players', 'percentage_of_players'])

def process_data_for_visualizations():
    """Process FIFA data for all visualizations."""
    try:
        print("Processing FIFA data for visualizations...")

        # Ensure data directory exists
        os.makedirs('data', exist_ok=True)

        # Load raw FIFA data (adjust the path as needed)
        raw_path = os.path.join('data', 'fifa_raw.csv')
        processed_path = os.path.join('data', 'fifa_processed.csv')

        if os.path.exists(processed_path):
            fifa_data = pd.read_csv(processed_path)
        elif os.path.exists(raw_path):
            fifa_data = pd.read_csv(raw_path)
            # (Insert any additional cleaning steps here if needed)
            fifa_data.to_csv(processed_path, index=False)
        else:
            print("No FIFA data found to process.")
            return

        # Generate league-country mapping
        create_league_country_mapping()

        # Generate club averages
        create_club_averages(fifa_data)

        # Generate country stats **with percentage column**
        create_country_stats(fifa_data)
        print("check--------------------------------------")

        print("All preprocessing complete.")

    except Exception as e:
        print(f"Error in process_data_for_visualizations: {e}")
        print(traceback.format_exc())


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
            'country', 'num_players', 'avg_overall', 'avg_value', 'percentage_of_players'
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