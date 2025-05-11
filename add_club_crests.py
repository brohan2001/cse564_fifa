import pandas as pd
from team_mapping import team_mapping

df = pd.read_csv("data/club_averages.csv")

# Add club_id using the imported mapping
df['club_id'] = df['club_name'].map(team_mapping)

# Generate crest URLs
df['club_crest_url'] = df['club_id'].apply(
    lambda cid: f"https://cdn.sofifa.net/teams/{int(cid)}/360.png" if pd.notna(cid) else None
)

df.to_csv("data/club_averages.csv", index=False)
print("club_id and crest URL added.")
