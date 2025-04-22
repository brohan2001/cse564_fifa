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
?

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