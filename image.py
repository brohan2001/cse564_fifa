import pandas as pd

def sofifa_image_url(player_id, size=360, year=23):
    """Generate SoFIFA image URL based on player_id, size, and FIFA year."""
    pid_str = str(player_id).zfill(6)
    return f"https://cdn.sofifa.net/players/{pid_str[:3]}/{pid_str[3:]}/{year}_{size}.png"

# Load the dataset
file_path = 'data/fifa_processed.csv'
df = pd.read_csv(file_path)

# Generate image_link column using player_id
df['image_link'] = df['player_id'].apply(lambda pid: sofifa_image_url(pid, size=360, year=23))

# Save back to the same file
df.to_csv(file_path, index=False)
