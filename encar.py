import sys
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
from bs4 import BeautifulSoup
import pandas as pd
import json

# 인자로 받은 값을 사용합니다.
manufacturer = sys.argv[1]
model = sys.argv[2]
sub_model = sys.argv[3]

print(f"크롤링을 시작합니다: 제조사={manufacturer}, 모델={model}, 세부모델={sub_model}")

# 드라이버 옵션 설정
options = webdriver.ChromeOptions()
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')
options.add_argument('--disable-blink-features=AutomationControlled')
options.add_argument('--disable-infobars')
options.add_argument('--disable-gpu')
options.add_argument('--disable-extensions')
options.add_experimental_option("excludeSwitches", ["enable-automation"])
options.add_experimental_option('useAutomationExtension', False)

driver = webdriver.Chrome(options=options)
car_lists = []
def init_crawl():
    driver.get("http://www.encar.com/index.do")

    # 차량 제조사 클릭
    button = WebDriverWait(driver, 10).until(EC.presence_of_all_elements_located((By.CLASS_NAME, "link_sub")))
    driver.execute_script("arguments[0].click();", button[0])

    # 인자로 받은 제조사 선택
    manufacturer_element = WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.XPATH, f"//a[contains(text(), '{manufacturer}')]")))
    driver.execute_script("arguments[0].click();", manufacturer_element)

    # 인자로 받은 모델 선택
    try:
        model_element = WebDriverWait(driver, 1).until(EC.presence_of_all_elements_located((By.XPATH, f"//a[text()='{model}']")))
        print("model:", model)
        if model == "아이오닉":
            driver.execute_script("arguments[0].click();", model_element[2])
        else:
            driver.execute_script("arguments[0].click();", model_element[0])
    except Exception as e:
        # 인자로 받은 모델 선택
        print("contains로 클릭")
        model_element = WebDriverWait(driver, 1).until(EC.presence_of_element_located((By.XPATH, f"//a[contains(text(), '{model}')]")))
        driver.execute_script("arguments[0].click();", model_element)

    try:
        # 인자로 받은 세부 모델 선택
        sub_model_element = WebDriverWait(driver, 1).until(EC.presence_of_element_located((By.XPATH, f"//a[text()='{sub_model}']")))
        driver.execute_script("arguments[0].click();", sub_model_element)
    except Exception as e:
        # 인자로 받은 세부 모델 선택
        print("contains로 클릭")
        sub_model_element = WebDriverWait(driver, 1).until(EC.presence_of_element_located((By.XPATH, f"//a[contains(text(), '{sub_model}')]")))
        driver.execute_script("arguments[0].click();", sub_model_element)

    # 검색 버튼 클릭
    search_button = WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.XPATH, "//a[@class='link_search' and span[contains(text(), '검색')]]")))
    driver.execute_script("arguments[0].click();", search_button)
flag = True
i = 1
def crawl():
    global car_list, car_lists4, flag, i
    car_lists4 = []
    while True:
        if flag:
            init_crawl()
            flag = False # 즉 처음만 이 함수를 실행
        if i >= 10:
            break
        try:
            # "data-page" 속성이 "2"인 a 태그를 기다리면서 찾기
            page_2_link = WebDriverWait(driver, 4).until(
                EC.presence_of_element_located((By.XPATH, f'//a[@data-page="{i}"]'))
            )
    
            # 요소 클릭하기
            page_2_link.click()
            print("요소가 성공적으로 클릭되었습니다.")
            i += 1
    
        except Exception as e:
            print("크롤링의 끝 도달")
            break
        error_cnt = 0
        while True: # stale error 생기면 계속 while문 반복.
            try:
                rows = driver.find_elements(By.XPATH, "//tr[@data-index]")

                for row in rows:
                    car_list = []
                    img_td = row.find_element(By.CLASS_NAME, 'img')
                    img_tag = img_td.find_element(By.TAG_NAME, 'img')
                    img_url = img_tag.get_attribute('src')
                    car_list.append(img_url)

                    inf_td = row.find_element(By.CLASS_NAME, 'inf')
                    car_list.append(inf_td.text.strip())

                    prc_td = row.find_element(By.CLASS_NAME, 'prc_hs')
                    car_list.append(prc_td.text.strip())

                    svc_td = row.find_element(By.CLASS_NAME, 'svc')
                    car_list.append(svc_td.text.strip())

                    car_lists.append(car_list)
                break # 여기까지 왔으면 break
            except Exception as e:
                print("stale error가 생김")
                print("error_cnt:", error_cnt)
                error_cnt += 1
                if error_cnt >= 4:
                    break 
                continue

        # 데이터 처리
        for p in car_lists:
            try:
                car_lists5 = {
                    "이미지": p[0],
                    "기종": p[1].split("\n")[0],
                    "주행거리": p[1].split("\n")[2],
                    "연료": p[1].split("\n")[1],
                    "지역": p[1].split("\n")[1],
                    "가격": p[2]
                }
                car_lists4.append(car_lists5)
            except Exception as e:
                print(f"오류 발생: {e}")

    # 딕셔너리를 튜플로 변환하여 중복 제거
    unique_car_lists = list({frozenset(item.items()): item for item in car_lists4}.values())

    print("unique_car_lists:", unique_car_lists)
    # 결과 출력
    print(json.dumps(unique_car_lists, ensure_ascii=False))

    # 엑셀 파일 저장
    df = pd.DataFrame(unique_car_lists)
    df.to_excel('car_lists4.xlsx', index=False)
    print("엑셀 파일로 저장되었습니다: car_lists4.xlsx")

crawl()