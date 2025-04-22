from flask import Flask, render_template, jsonify, request
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
import json
import os
import traceback

app = Flask(__name__)

# Ensure data directory exists
os.makedirs('data', exist_ok=True)

# Global variables to store loaded data
fifa_data = None
club_stats = None
country_stats = None
league_countries = None

# Function to load data with improved error handling
def load_data():
    global fifa_data, club_stats, country_stats, league_countries
    
    try:
        print("Starting data loading process...")
        
        # Check if processed files exist, if not, run preprocessing
        fifa_processed_path = os.path.join('data', 'fifa_processed.csv')
        if not os.path.exists(fifa_processed_path):
            print("Processed data not found. Running preprocessing...")
            try:
                import preprocessing
                preprocessing.process_data_for_visualizations()
                print("Preprocessing completed successfully")
            except Exception as e:
                print(f"Error during preprocessing: {e}")
                print(traceback.format_exc())
                raise
        
        # Load processed data with error checking
        try:
            fifa_data = pd.read_csv(os.path.join('data', 'fifa_processed.csv'))
            print(f"Loaded fifa_data: {len(fifa_data)} rows")
            # Print column names for debugging
            print(f"FIFA data columns: {fifa_data.columns.tolist()}")
            # Print first row for debugging
            print(f"First row sample: {fifa_data.iloc[0].to_dict()}")
        except Exception as e:
            print(f"Error loading fifa_processed.csv: {e}")
            print(traceback.format_exc())
            fifa_data = pd.DataFrame()
        
        try:
            club_stats = pd.read_csv(os.path.join('data', 'club_averages.csv'))
            print(f"Loaded club_stats: {len(club_stats)} rows")
        except Exception as e:
            print(f"Error loading club_averages.csv: {e}")
            print(traceback.format_exc())
            club_stats = pd.DataFrame()
        
        try:
            country_stats = pd.read_csv(os.path.join('data', 'country_stats.csv'))
            print(f"Loaded country_stats: {len(country_stats)} rows")
        except Exception as e:
            print(f"Error loading country_stats.csv: {e}")
            print(traceback.format_exc())
            country_stats = pd.DataFrame()
        
        try:
            league_countries = pd.read_csv(os.path.join('data', 'league_countries.csv'))
            print(f"Loaded league_countries: {len(league_countries)} rows")
        except Exception as e:
            print(f"Error loading league_countries.csv: {e}")
            print(traceback.format_exc())
            league_countries = pd.DataFrame()
        
        print("Data loading completed")
            
    except Exception as e:
        print(f"Unhandled error in data loading: {e}")
        print(traceback.format_exc())
        # Initialize with empty DataFrames to prevent NoneType errors
        fifa_data = pd.DataFrame()
        club_stats = pd.DataFrame()
        country_stats = pd.DataFrame()
        league_countries = pd.DataFrame()

# Use a before_request handler with improved error handling
@app.before_request
def before_request():
    global fifa_data
    
    # Only load data if it hasn't been loaded yet
    if fifa_data is None:
        try:
            load_data()
        except Exception as e:
            print(f"Error in before_request handler: {e}")
            print(traceback.format_exc())

# API Routes with error handling
@app.route('/')
def index():
    """Render main dashboard"""
    return render_template('index.html')

@app.route('/api/countries')
def get_countries():
    """Return country statistics for world map"""
    try:
        if country_stats is None or country_stats.empty:
            print("Warning: country_stats is empty or None")
            return jsonify([])
        return jsonify(country_stats.to_dict(orient='records'))
    except Exception as e:
        print(f"Error in get_countries: {e}")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@app.route('/api/leagues')
def get_leagues():
    """Return league information"""
    try:
        if league_countries is None or league_countries.empty:
            print("Warning: league_countries is empty or None")
            return jsonify([])
        return jsonify(league_countries.to_dict(orient='records'))
    except Exception as e:
        print(f"Error in get_leagues: {e}")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@app.route('/api/clubs')
def get_clubs():
    """Return club statistics, optionally filtered by league"""
    try:
        if club_stats is None or club_stats.empty:
            print("Warning: club_stats is empty or None")
            return jsonify([])
            
        league = request.args.get('league', None)
        
        if league:
            filtered_clubs = club_stats[club_stats['league_name'] == league]
            return jsonify(filtered_clubs.to_dict(orient='records'))
        
        return jsonify(club_stats.to_dict(orient='records'))
    except Exception as e:
        print(f"Error in get_clubs: {e}")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@app.route('/api/players')
def get_players():
    """Return player data, optionally filtered by league, club or country"""
    try:
        if fifa_data is None or fifa_data.empty:
            print("Warning: fifa_data is empty or None")
            return jsonify([])
            
        filtered_data = fifa_data.copy()
        
        # Get filter parameters
        league = request.args.get('league', None)
        club = request.args.get('club', None)
        country = request.args.get('country', None)
        
        # Apply filters
        if league:
            filtered_data = filtered_data[filtered_data['league_name'] == league]
        
        if club:
            filtered_data = filtered_data[filtered_data['club_name'] == club]
        
        if country:
            filtered_data = filtered_data[filtered_data['country'] == country]
        
        # Convert to records
        result = filtered_data.to_dict(orient='records')
        print(f"Returning {len(result)} players")
        
        return jsonify(result)
    except Exception as e:
        print(f"Error in get_players: {e}")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@app.route('/api/pca')
def get_pca():
    """Perform PCA on player attributes, optionally filtered by league"""
    try:
        if fifa_data is None or fifa_data.empty:
            print("Warning: fifa_data is empty or None for PCA")
            return jsonify({
                "players": [],
                "loadings": [],
                "feature_names": [],
                "explained_variance": []
            })
            
        # Filter data if league is specified
        data = fifa_data.copy()
        league = request.args.get('league', None)
        
        if league:
            data = data[data['league_name'] == league]
        
        # Select numerical attributes for PCA
        attributes = ['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physic', 
                    'player_overall', 'age', 'value_millions_eur']
        
        # Check if data has these columns
        missing_columns = [col for col in attributes if col not in data.columns]
        if missing_columns:
            print(f"Warning: Missing columns for PCA: {missing_columns}")
            print(f"Available columns: {data.columns.tolist()}")
            return jsonify({
                "error": f"Missing columns: {missing_columns}",
                "players": [],
                "loadings": [],
                "feature_names": [col for col in attributes if col in data.columns],
                "explained_variance": []
            })
        
        # Handle missing values
        for attr in attributes:
            if data[attr].isnull().any():
                print(f"Warning: Filling {data[attr].isnull().sum()} missing values in {attr}")
                data[attr] = data[attr].fillna(data[attr].mean())
        
        X = data[attributes].values
        
        # Standardize the data
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        
        # Perform PCA
        pca = PCA(n_components=2)
        pca_result = pca.fit_transform(X_scaled)
        
        # Create result with PCA coordinates and player data
        result = data[['player_id', 'short_name', 'club_name', 'nationality_name', 'player_positions']].copy()
        result['pca_x'] = pca_result[:, 0]
        result['pca_y'] = pca_result[:, 1]
        
        # Add loadings for the biplot
        loadings = pca.components_.T * np.sqrt(pca.explained_variance_)
        
        return jsonify({
            'players': result.to_dict(orient='records'),
            'loadings': loadings.tolist(),
            'feature_names': attributes,
            'explained_variance': pca.explained_variance_ratio_.tolist()
        })
    except Exception as e:
        print(f"Error in get_pca: {e}")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

# Add a debug route to check data loading status
@app.route('/api/debug/status')
def debug_status():
    """Return status of loaded data for debugging"""
    return jsonify({
        'fifa_data': {
            'loaded': fifa_data is not None,
            'row_count': len(fifa_data) if fifa_data is not None else 0,
            'columns': fifa_data.columns.tolist() if fifa_data is not None else []
        },
        'club_stats': {
            'loaded': club_stats is not None,
            'row_count': len(club_stats) if club_stats is not None else 0,
            'columns': club_stats.columns.tolist() if club_stats is not None else []
        },
        'country_stats': {
            'loaded': country_stats is not None,
            'row_count': len(country_stats) if country_stats is not None else 0,
            'columns': country_stats.columns.tolist() if country_stats is not None else []
        },
        'league_countries': {
            'loaded': league_countries is not None,
            'row_count': len(league_countries) if league_countries is not None else 0,
            'columns': league_countries.columns.tolist() if league_countries is not None else []
        }
    })

# Add a route to trigger data reloading
@app.route('/api/debug/reload')
def reload_data():
    """Manually reload all data"""
    global fifa_data, club_stats, country_stats, league_countries
    fifa_data = None
    club_stats = None
    country_stats = None
    league_countries = None
    load_data()
    return jsonify({"status": "Data reloaded"})

if __name__ == '__main__':
    # Load data at startup
    load_data()
    app.run(debug=True, port=5000)