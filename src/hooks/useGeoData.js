// src/hooks/useGeoData.js
import { useState, useEffect } from 'react';

export const useGeoData = () => {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const basePath = process.env.PUBLIC_URL || '';
    const fetchData = async () => {
      try {
        const [c, s, ci] = await Promise.all([
          fetch(`${basePath}/data/countries.json`),
          fetch(`${basePath}/data/states.json`),
          fetch(`${basePath}/data/cities.json`)
        ]);
        const [countriesData, statesData, citiesData] = await Promise.all([
          c.json(), s.json(), ci.json()
        ]);
        setCountries(countriesData);
        setStates(statesData);
        setCities(citiesData);
      } catch (err) {
        console.error('Geo data error:', err);
        setCountries([{ id: 1, name: 'Angola' }]);
        setStates([{ id: 1, name: 'Luanda', country: 'Angola' }]);
        setCities([{ id: 1, name: 'Luanda', state: 'Luanda', country: 'Angola' }]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatesByCountry = (c) => states.filter(s => s.country === c);
  const getCitiesByState = (s, c) => cities.filter(ci => ci.state === s && ci.country === c);

  return { countries, getStatesByCountry, getCitiesByState, loading };
};