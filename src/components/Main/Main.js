import React, { useEffect, useState } from 'react';
import './Main.css';
import axios from 'axios';

function Main() {
  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [manufacturer, setManufacturer] = useState('All');
  const [model, setModel] = useState('All');
  const [subModel, setSubModel] = useState('All');

  const carOptions = {
    현대: {
      그랜저: ["그랜저 (GN7)"]
    },
    제네시스: {
      G80: ["일렉트리파이드"]
    },
    기아: {
        K7: ["K7 프리미어"],
        K5: ["더 뉴 K5"]
      }
  };

  useEffect(() => {
    fetchCarData();
  }, []);

  const fetchCarData = () => {
    axios.get('http://localhost:3001/cars')
      .then(response => {
        const sortedData = response.data.sort((a, b) => 
          parseInt(a['가격'].replace(/[^0-9]/g, '')) - parseInt(b['가격'].replace(/[^0-9]/g, ''))
        );
        setCars(sortedData);
        setFilteredCars(sortedData);
      })
      .catch(error => console.error('Error fetching car data:', error));
  };

  const handleFilter = () => {
    let filtered = cars;

    if (manufacturer !== 'All') {
      filtered = filtered.filter(car => car.manufacturer === manufacturer);
    }
    if (model !== 'All') {
      filtered = filtered.filter(car => car.model === model);
    }
    if (subModel !== 'All') {
      filtered = filtered.filter(car => car.subModel === subModel);
    }
    
    setFilteredCars(filtered);
  };

  useEffect(() => {
    handleFilter();
  }, [manufacturer, model, subModel]);

  const handleCrawl = () => {
    if (manufacturer === 'All' || model === 'All' || subModel === 'All') {
      alert('제조사, 모델, 세부 모델을 모두 선택하세요.');
      return;
    }

    axios.post('http://localhost:3001/scrape', {
      manufacturer: manufacturer,
      model: model,
      subModel: subModel
    })
    .then(response => {
      alert('크롤링이 완료되었습니다!');
      fetchCarData(); 
    })
    .catch(error => {
      console.error('크롤링 중 오류 발생:', error);
      alert('크롤링 중 오류가 발생했습니다. 다시 시도해주세요.');
    });
  };

  return (
    <div className="main-container">
      <header className="header">
        <h1>Used Car Marketplace</h1>
        <button className="crawl-button" onClick={handleCrawl}>크롤링 시작</button>
        <div className="filter-section">
          <select className="dropdown" value={manufacturer} onChange={(e) => setManufacturer(e.target.value)}>
            <option value="All">제조사 선택</option>
            {Object.keys(carOptions).map(manufacturer => (
              <option key={manufacturer} value={manufacturer}>{manufacturer}</option>
            ))}
          </select>
          <select className="dropdown" value={model} onChange={(e) => setModel(e.target.value)} disabled={manufacturer === 'All'}>
            <option value="All">모델 선택</option>
            {manufacturer !== 'All' && carOptions[manufacturer] && Object.keys(carOptions[manufacturer]).map(model => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
          <select className="dropdown" value={subModel} onChange={(e) => setSubModel(e.target.value)} disabled={model === 'All'}>
            <option value="All">세부모델 선택</option>
            {manufacturer !== 'All' && model !== 'All' && carOptions[manufacturer] && carOptions[manufacturer][model] && carOptions[manufacturer][model].map(subModel => (
              <option key={subModel} value={subModel}>{subModel}</option>
            ))}
          </select>
        </div>
      </header>
      
      <div className="car-table-container">
        <table className="car-table">
          <thead>
            <tr>
              <th>이미지</th>
              <th>기종</th>
              <th>주행거리</th>
              <th>연료</th>
              <th>지역</th>
              <th>가격</th>
            </tr>
          </thead>
          <tbody>
            {filteredCars.map((car, index) => (
              <tr key={index}>
                <td><img src={car['이미지']} alt={car['기종']} className="car-image" /></td>
                <td>{car['기종']}</td>
                <td>{car['주행거리']}</td>
                <td>{car['연료']}</td>
                <td>{car['지역']}</td>
                <td>{car['가격']}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Main;