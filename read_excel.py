import pandas as pd
import json

def read_excel():
    try:
        df = pd.read_excel('car_lists4.xlsx')
        car_data = df.to_dict(orient='records')
        print(json.dumps(car_data, ensure_ascii=False))  # JSON 데이터를 정확히 출력
    except Exception as e:
        print(f"Error reading excel file: {e}")

read_excel()