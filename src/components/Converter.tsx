'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY

const unitCategories = {
  length: ['meters', 'feet', 'inches', 'centimeters', 'kilometers', 'miles', 'yards'],
  temperature: ['Celsius', 'Fahrenheit', 'Kelvin'],
  area: ['square meters', 'square feet', 'acres', 'hectares', 'square kilometers'],
  volume: ['liters', 'gallons', 'cubic meters', 'cubic feet', 'milliliters'],
  weight: ['kilograms', 'pounds', 'ounces', 'tons', 'grams'],
  time: ['seconds', 'minutes', 'hours', 'days', 'weeks', 'months', 'years'],
}

const conversionFactors = {
  length: {
    meters: {
      feet: 3.28084,
      inches: 39.3701,
      centimeters: 100,
      kilometers: 0.001,
      miles: 0.000621371,
      yards: 1.09361,
    },
    feet: {
      meters: 0.3048,
      inches: 12,
      centimeters: 30.48,
      kilometers: 0.0003048,
      miles: 0.000189394,
      yards: 0.333333,
    },
  },
  area: {
    'square meters': {
      'square feet': 10.7639,
      acres: 0.000247105,
      hectares: 0.0001,
      'square kilometers': 0.000001,
    },
  },
  volume: {
    liters: {
      gallons: 0.264172,
      'cubic meters': 0.001,
      'cubic feet': 0.0353147,
      milliliters: 1000,
    },
  },
  weight: {
    kilograms: {
      pounds: 2.20462,
      ounces: 35.274,
      tons: 0.001,
      grams: 1000,
    },
  },
  time: {
    seconds: {
      minutes: 1/60,
      hours: 1/3600,
      days: 1/86400,
      weeks: 1/604800,
      months: 1/2629746,
      years: 1/31556952,
    },
  },
}

export default function Converter() {
  const [category, setCategory] = useState('length')
  const [fromUnit, setFromUnit] = useState(unitCategories.length[0])
  const [toUnit, setToUnit] = useState(unitCategories.length[1])
  const [value, setValue] = useState('')
  const [result, setResult] = useState('')
  const [aiExample, setAiExample] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setFromUnit(unitCategories[category][0])
    setToUnit(unitCategories[category][1])
  }, [category])

  const convertUnits = async () => {
    setIsLoading(true)
    setError('')
    setResult('')
    setAiExample('')

    try {
      let convertedValue = parseFloat(value)

      if (!isNaN(convertedValue)) {
        if (conversionFactors[category] && conversionFactors[category][fromUnit] && conversionFactors[category][fromUnit][toUnit]) {
          convertedValue *= conversionFactors[category][fromUnit][toUnit]
        } else if (category === 'temperature') {
          if (fromUnit === 'Celsius' && toUnit === 'Fahrenheit') {
            convertedValue = (convertedValue * 9/5) + 32
          } else if (fromUnit === 'Fahrenheit' && toUnit === 'Celsius') {
            convertedValue = (convertedValue - 32) * 5/9
          } else if (fromUnit === 'Celsius' && toUnit === 'Kelvin') {
            convertedValue = convertedValue + 273.15
          } else if (fromUnit === 'Kelvin' && toUnit === 'Celsius') {
            convertedValue = convertedValue - 273.15
          } else if (fromUnit === 'Fahrenheit' && toUnit === 'Kelvin') {
            convertedValue = (convertedValue - 32) * 5/9 + 273.15
          } else if (fromUnit === 'Kelvin' && toUnit === 'Fahrenheit') {
            convertedValue = (convertedValue - 273.15) * 9/5 + 32
          }
        }

        setResult(`${value} ${fromUnit} is equal to ${convertedValue.toFixed(2)} ${toUnit}`)

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{
              role: "user",
              content: `Give me an example of something that is approximately ${convertedValue.toFixed(2)} ${toUnit} in ${category}. Respond in one short sentence.`
            }]
          })
        })

        const data = await response.json()
        setAiExample(data.choices[0].message.content)
      } else {
        setError('Please enter a valid number')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <header className="bg-gray-800 py-4">
        <nav className="container mx-auto px-4">
          <ul className="flex justify-end space-x-6">
            <li><a href="#" className="hover:text-teal-400 transition-colors">Home</a></li>
            <li><a href="#" className="hover:text-teal-400 transition-colors">About</a></li>
            <li><a href="#" className="hover:text-teal-400 transition-colors">Contact</a></li>
          </ul>
        </nav>
      </header>
      
      <section className="py-20 text-center relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10"
        >
          <h1 className="text-5xl font-bold mb-4 text-teal-400">MeasureMinds</h1>
          <p className="text-2xl text-gray-300 mb-8">Convert units and get real-world size comparisons!</p>
        </motion.div>
        <motion.div
          className="absolute inset-0 z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-500 opacity-30"></div>
          <svg className="absolute bottom-0 left-0 right-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path fill="#1F2937" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,128C960,128,1056,192,1152,213.3C1248,235,1344,213,1392,202.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </motion.div>
      </section>

      <section className="max-w-3xl mx-auto px-4 mb-20">
        <motion.div 
          className="bg-gray-800 shadow-lg rounded-lg p-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-3xl font-semibold mb-4 text-center text-teal-400">Unit Converter</h2>
          <div className="space-y-6">
            <div className="flex space-x-4">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 border rounded-md bg-gray-700 text-gray-100 border-gray-600 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                {Object.keys(unitCategories).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex space-x-4">
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter value"
                className="flex-1 p-3 border rounded-md bg-gray-700 text-gray-100 border-gray-600 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                className="w-1/3 p-3 border rounded-md bg-gray-700 text-gray-100 border-gray-600 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                {unitCategories[category].map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-center">
              <motion.span 
                className="text-4xl text-teal-400"
                animate={{ rotate: 180 }}
                transition={{ duration: 0.5 }}
              >
                ↓
              </motion.span>
            </div>
            <div className="flex space-x-4">
              <div className="flex-1"></div>
              <select
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className="w-1/3 p-3 border rounded-md bg-gray-700 text-gray-100 border-gray-600 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                {unitCategories[category].map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
            <motion.button
              onClick={convertUnits}
              disabled={isLoading}
              className="w-full bg-teal-600 text-white p-3 rounded-md hover:bg-teal-700 disabled:bg-teal-800 disabled:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isLoading ? 'Converting...' : 'Convert'}
            </motion.button>
          </div>
          {error && <p className="text-red-400 mt-4">{error}</p>}
          {result && (
            <motion.div 
              className="mt-8 p-4 bg-gray-700 rounded-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-xl font-semibold mb-2 text-teal-400">Result:</h3>
              <p className="text-lg">{result}</p>
            </motion.div>
          )}
          {aiExample && (
            <motion.div 
              className="mt-6 p-4 bg-gray-700 rounded-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <h3 className="text-xl font-semibold mb-2 text-teal-400">AI-based Size Comparison:</h3>
              <p className="text-lg">{aiExample}</p>
            </motion.div>
          )}
          <p className="flex justify-center text-sm font-normal mt-2">AI can make mistakes.</p>
        </motion.div>
        
      </section>

      <section className="max-w-3xl mx-auto px-4 mb-20">
        <motion.div 
          className="bg-gray-800 shadow-lg rounded-lg p-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-semibold mb-6 text-center text-teal-400">Understanding Unit Conversion</h2>
          <div className="prose prose-invert prose-teal max-w-none">
            <p>
              Unit conversion is the process of changing a measurement from one unit to another. It's an essential skill in many fields, including science, engineering, and everyday life. Understanding how to convert between different units allows us to compare measurements and make sense of data presented in various formats.
            </p>
            <h3>Why Unit Conversion Matters</h3>
            <p>
              Unit conversion is crucial for several reasons:
            </p>
            <ul>
              <li>It enables clear communication across different systems of measurement.</li>
              <li>It helps prevent errors in calculations and decision-making.</li>
              <li>It allows for the comparison of quantities expressed in different units.</li>
              <li>It's essential for international trade and collaboration in science and engineering.</li>
            </ul>
            <h3>Basic Principles of Unit Conversion</h3>
            <p>
              To convert between units, we use conversion factors. A conversion factor is a ratio of equivalent measurements. For example, 1 meter = 100 centimeters is a conversion factor. To convert from one unit to another, we multiply the original measurement by the appropriate conversion factor.
            </p>
            <h3>Common Conversion Challenges</h3>
            <p>
              Some conversions can be tricky:
            </p>
            <ul>
              <li>Temperature conversions (Celsius, Fahrenheit, Kelvin) involve both multiplication and addition.</li>
              <li>Converting between different systems (metric to imperial) requires memorizing or looking up conversion factors.</li>
              <li>Some units, like volume, can be expressed in different dimensions (e.g., liters vs. cubic meters), requiring multiple conversion steps.</li>
            </ul>
            <p>
              Practice and familiarity with common conversion factors can make unit conversion easier over time. Tools like our unit converter can also help simplify the process and provide quick, accurate results.
            </p>
          </div>
        </motion.div>
      </section>
    </div>
  )
}