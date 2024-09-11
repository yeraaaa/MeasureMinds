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

const conversionFactors: {
  [key in keyof typeof unitCategories]?: {
    [unit: string]: {
      [unit: string]: number
    }
  }
} = {
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
      minutes: 1 / 60,
      hours: 1 / 3600,
      days: 1 / 86400,
      weeks: 1 / 604800,
      months: 1 / 2629746,
      years: 1 / 31556952,
    },
  },
}

export default function Converter() {
  const [category, setCategory] = useState<keyof typeof unitCategories>('length')
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
        if (category === 'temperature') {
          // Handle temperature conversions separately
          if (fromUnit === 'Celsius' && toUnit === 'Fahrenheit') {
            convertedValue = (convertedValue * 9) / 5 + 32
          } else if (fromUnit === 'Fahrenheit' && toUnit === 'Celsius') {
            convertedValue = ((convertedValue - 32) * 5) / 9
          } else if (fromUnit === 'Celsius' && toUnit === 'Kelvin') {
            convertedValue = convertedValue + 273.15
          } else if (fromUnit === 'Kelvin' && toUnit === 'Celsius') {
            convertedValue = convertedValue - 273.15
          } else if (fromUnit === 'Fahrenheit' && toUnit === 'Kelvin') {
            convertedValue = ((convertedValue - 32) * 5) / 9 + 273.15
          } else if (fromUnit === 'Kelvin' && toUnit === 'Fahrenheit') {
            convertedValue = ((convertedValue - 273.15) * 9) / 5 + 32
          }
        } else if (
          conversionFactors[category] &&
          conversionFactors[category]![fromUnit] &&
          conversionFactors[category]![fromUnit][toUnit]
        ) {
          // Use conversionFactors for non-temperature categories
          convertedValue *= conversionFactors[category]![fromUnit][toUnit]
        }

        setResult(`${value} ${fromUnit} is equal to ${convertedValue.toFixed(2)} ${toUnit}`)

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'user',
                content: `Give me an example of something that is approximately ${convertedValue.toFixed(
                  2
                )} ${toUnit} in ${category}. Respond in one short sentence.`,
              },
            ],
          }),
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
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <motion.h1
          className="text-4xl font-bold mb-10 text-center"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Unit Converter
        </motion.h1>

        <div className="flex flex-col md:flex-row justify-center items-center space-x-4">
          <div className="mb-4">
            <label htmlFor="category" className="block mb-2">
              Select Category
            </label>
            <select
              id="category"
              className="px-4 py-2 bg-gray-800 text-white rounded-md"
              value={category}
              onChange={(e) => setCategory(e.target.value as keyof typeof unitCategories)}
            >
              {Object.keys(unitCategories).map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="fromUnit" className="block mb-2">
              From
            </label>
            <select
              id="fromUnit"
              className="px-4 py-2 bg-gray-800 text-white rounded-md"
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
            >
              {unitCategories[category].map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="toUnit" className="block mb-2">
              To
            </label>
            <select
              id="toUnit"
              className="px-4 py-2 bg-gray-800 text-white rounded-md"
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
            >
              {unitCategories[category].map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-4 w-full max-w-md">
          <label htmlFor="value" className="block mb-2">
            Value
          </label>
          <input
            type="number"
            id="value"
            className="w-full px-4 py-2 bg-gray-800 text-white rounded-md"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>

        <button
          onClick={convertUnits}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md"
          disabled={isLoading}
        >
          {isLoading ? 'Converting...' : 'Convert'}
        </button>

        {error && <p className="mt-4 text-red-500">{error}</p>}
        {result && <p className="mt-4 text-green-500">{result}</p>}
        {aiExample && <p className="mt-4 text-yellow-500">AI Example: {aiExample}</p>}
      </div>
    </div>
  )
}
