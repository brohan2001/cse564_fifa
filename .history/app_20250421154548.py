from flask import Flask, render_template, jsonify, request
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
import json
import os

app = Flask(__name__)

# Ensure data directory exists
os.makedirs('data', exist_ok=True)

# Global variables to store loaded data
fifa_data = None
club_stats = None
country_stats = None
league_countries = None

# Function to load data (will be called before first request)
# def load_data():
    global fifa_data, club_stats, country_stats, league_countries
    
    # Check if processed files exist, if not, run preprocessing
    if not os.path.exists('data/fifa_processed.csv'):
        import preprocessing
        preprocessing.process_data_for_visualizations()
    
    # Load processed data
    fifa_data = pd.read_csv('data/fifa_processed.csv')
    club_stats = pd.read_csv('data/club_averages.csv')
    country_stats = pd.read_csv('data/country_stats.csv')
    league_countries = pd.read_csv('data/league_countries.csv')

# In app.py, modify the load_data function to add error handling
  def load_data():
    global fifa_data, club_stats, country_stats, league_countries
    
    try:
        # Check if processed files exist, if not, run preprocessing
        fifa_processed_path = os.path.join('data', 'fifa_processed.csv')
        if not os.path.exists(fifa_processed_path):
            print("Processed data not found. Running preprocessing...")
            import preprocessing
            preprocessing.process_data_for_visualizations()
        
        # Load processed data with error checking
        try:
            fifa_data = pd.read_csv(os.path.join('data', 'fifa_processed.csv'))
            print(f"Loaded fifa_data: {len(fifa_data)} rows")
        except Exception as e:
            print(f"Error loading fifa_processed.csv: {e}")
            fifa_data = pd.DataFrame()
        
        try:
            club_stats = pd.read_csv(os.path.join('data', 'club_averages.csv'))
            print(f"Loaded club_stats: {len(club_stats)} rows")
        except Exception as e:
            print(f"Error loading club_averages.csv: {e}")
            club_stats = pd.DataFrame()
        
        try:
            country_stats = pd.read_csv(os.path.join('data', 'country_stats.csv'))
            print(f"Loaded country_stats: {len(country_stats)} rows")
        except Exception as e:
            print(f"Error loading country_stats.csv: {e}")
            country_stats = pd.DataFrame()
        
        try:
            league_countries = pd.read_csv(os.path.join('data', 'league_countries.csv'))
            print(f"Loaded league_countries: {len(league_countries)} rows")
        except Exception as e:
            print(f"Error loading league_countries.csv: {e}")
            league_countries = pd.DataFrame()
            
    except Exception as e:
        print(f"Error in data loading: {e}")

# Use a before_request handler instead
@app.before_request
def before_request():
    global fifa_data
    
    # Only load data if it hasn't been loaded yet
    if fifa_data is None:
        load_data()

# API Routes
@app.route('/')
def index():
    """Render main dashboard"""
    return render_template('index.html')

@app.route('/api/countries')
def get_countries():
    """Return country statistics for world map"""
    return jsonify(country_stats.to_dict(orient='records'))

@app.route('/api/leagues')
def get_leagues():
    """Return league information"""
    return jsonify(league_countries.to_dict(orient='records'))

@app.route('/api/clubs')
def get_clubs():
    """Return club statistics, optionally filtered by league"""
    league = request.args.get('league', None)
    
    if league:
        filtered_clubs = club_stats[club_stats['league_name'] == league]
        return jsonify(filtered_clubs.to_dict(orient='records'))
    
    return jsonify(club_stats.to_dict(orient='records'))

@app.route('/api/players')
def get_players():
    """Return player data, optionally filtered by league, club or country"""
    league = request.args.get('league', None)
    club = request.args.get('club', None)
    country = request.args.get('country', None)
    
    filtered_data = fifa_data.copy()
    
    if league:
        filtered_data = filtered_data[filtered_data['league_name'] == league]
    
    if club:
        filtered_data = filtered_data[filtered_data['club_name'] == club]
    
    if country:
        filtered_data = filtered_data[filtered_data['country'] == country]
    
    return jsonify(filtered_data.to_dict(orient='records'))

@app.route('/api/pca')
def get_pca():
    """Perform PCA on player attributes, optionally filtered by league"""
    league = request.args.get('league', None)
    
    # Filter data if league is specified
    data = fifa_data.copy()
    if league:
        data = data[data['league_name'] == league]
    
    # Select numerical attributes for PCA
    attributes = ['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physic', 
                  'player_overall', 'age', 'value_millions_eur']
    
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

if __name__ == '__main__':
    app.run(debug=True, port=5000)