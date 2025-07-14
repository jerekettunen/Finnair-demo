import axios from 'axios'
import * as fs from 'fs'

// Load API URL from CDK outputs
const outputs = JSON.parse(fs.readFileSync('cdk-outputs.json', 'utf8'))
const API_URL = outputs.FinnairStack.ApiUrl
const SEED_URL = outputs.FinnairStack.SeedDataUrl

console.log('>> FINNAIR CREWPAS DEMO')
console.log('=======================')
console.log(`API: ${API_URL}`)

async function demo() {
  try {
    // 1. Seed data
    console.log('\n[1] Seeding database...')
    const seedResponse = await axios.post(SEED_URL)
    console.log('> Done')
    console.log('> Raw response:')
    console.log(JSON.stringify(seedResponse.data, null, 2))

    // 2. Get flight passengers - High traffic flight
    console.log('\n[2] High-traffic flight: AY123 (HEL→LHR)')
    const url1 = `${API_URL}passengers?flightNumber=AY123&departureDate=2024-01-15`
    console.log(`> URL: ${url1}`)
    const flight1 = await axios.get(url1)
    console.log('> Raw response:')
    console.log(JSON.stringify(flight1.data, null, 2))
    console.log(`\n> Found ${flight1.data.length} passengers:`)
    flight1.data.forEach((p: any) =>
      console.log(
        `  - ${p.firstName} ${p.lastName} (${p.passengerId}) - Booking: ${p.bookingId}`
      )
    )

    // 3. Business traveler with complex booking
    console.log('\n[3] Business traveler: PAX001 (Multi-city route)')
    const url2 = `${API_URL}passengers/PAX001`
    console.log(`> URL: ${url2}`)
    const passenger1 = await axios.get(url2)
    console.log('> Raw response:')
    console.log(JSON.stringify(passenger1.data, null, 2))
    console.log(
      `\n> ${passenger1.data.firstName} ${passenger1.data.lastName} has ${passenger1.data.flights.length} flights:`
    )
    passenger1.data.flights.forEach((f: any, i: number) =>
      console.log(
        `  ${i + 1}. ${f.flightNumber}: ${f.departureAirport}→${
          f.arrivalAirport
        } (${f.departureDate})`
      )
    )

    // 4. Family booking member
    console.log('\n[4] Family booking: PAX002 (Family of 4)')
    const url3 = `${API_URL}passengers/PAX002`
    console.log(`> URL: ${url3}`)
    const family = await axios.get(url3)
    console.log('> Raw response:')
    console.log(JSON.stringify(family.data, null, 2))
    console.log(
      `\n> Family member: ${family.data.firstName} ${family.data.lastName}`
    )
    console.log(`   * Booking: ${family.data.bookingId} (shared with family)`)
    console.log(`   * Family flights: ${family.data.flights.length}`)

    // 5. Same-day different route
    console.log('\n[5] Same-day alternative: AY789 (HEL→CDG)')
    const url4 = `${API_URL}passengers?flightNumber=AY789&departureDate=2024-01-15`
    console.log(`> URL: ${url4}`)
    const flight2 = await axios.get(url4)
    console.log('> Raw response:')
    console.log(JSON.stringify(flight2.data, null, 2))
    console.log(
      `\n> Found ${flight2.data.length} passengers (corporate group + multi-city):`
    )
    flight2.data.forEach((p: any) =>
      console.log(
        `  - ${p.firstName} ${p.lastName} (${p.passengerId}) - Booking: ${p.bookingId}`
      )
    )

    // 6. Corporate group member
    console.log('\n[6] Corporate group: PAX006 (Company booking)')
    const url5 = `${API_URL}passengers/PAX006`
    console.log(`> URL: ${url5}`)
    const corporate = await axios.get(url5)
    console.log('> Raw response:')
    console.log(JSON.stringify(corporate.data, null, 2))
    console.log(
      `\n> Corporate traveler: ${corporate.data.firstName} ${corporate.data.lastName}`
    )
    console.log(`   * Company email: ${corporate.data.email}`)
    console.log(`   * Group booking: ${corporate.data.bookingId}`)

    // 7. International long-haul
    console.log('\n[7] International long-haul: AY101 (HEL→NRT)')
    const url6 = `${API_URL}passengers?flightNumber=AY101&departureDate=2024-01-15`
    console.log(`> URL: ${url6}`)
    const longHaul = await axios.get(url6)
    console.log('> Raw response:')
    console.log(JSON.stringify(longHaul.data, null, 2))
    console.log(`\n> Long-haul passenger: ${longHaul.data.length} passenger`)
    if (longHaul.data.length > 0) {
      console.log(
        `  - ${longHaul.data[0].firstName} ${longHaul.data[0].lastName} (${longHaul.data[0].passengerId})`
      )
    }

    // 8. Multi-city same-day traveler
    console.log('\n[8] Multi-city same-day: PAX011 (HEL→ARN→CDG)')
    const url7 = `${API_URL}passengers/PAX011`
    console.log(`> URL: ${url7}`)
    const multiCity = await axios.get(url7)
    console.log('> Raw response:')
    console.log(JSON.stringify(multiCity.data, null, 2))
    console.log(
      `\n> Multi-city traveler: ${multiCity.data.firstName} ${multiCity.data.lastName}`
    )
    console.log(`   * Same-day flights: ${multiCity.data.flights.length}`)
    multiCity.data.flights.forEach((f: any) =>
      console.log(
        `     - ${f.flightNumber}: ${f.departureAirport}→${f.arrivalAirport}`
      )
    )

    // 9. Return flight scenario
    console.log('\n[9] Return flight: AY124 (LHR→HEL)')
    const url8 = `${API_URL}passengers?flightNumber=AY124&departureDate=2024-01-16`
    console.log(`> URL: ${url8}`)
    const returnFlight = await axios.get(url8)
    console.log('> Raw response:')
    console.log(JSON.stringify(returnFlight.data, null, 2))
    console.log(
      `\n> Return flight passengers: ${returnFlight.data.length} (family + business)`
    )
    returnFlight.data.forEach((p: any) =>
      console.log(
        `  - ${p.firstName} ${p.lastName} (${p.passengerId}) - ${p.bookingId}`
      )
    )

    // 10. Error handling demo
    console.log('\n[10] Error handling: Invalid flight')
    const url9 = `${API_URL}passengers?flightNumber=XX999&departureDate=2024-01-15`
    console.log(`> URL: ${url9}`)
    try {
      await axios.get(url9)
      console.log('! Expected error but got success')
    } catch (error: any) {
      console.log('> Expected error response:')
      console.log(
        JSON.stringify(error.response?.data || error.message, null, 2)
      )
    }

    console.log('\n-- DEMO COMPLETE!')
    console.log('==================')
    console.log('+ High-traffic flight manifest (7 passengers, 3 bookings)')
    console.log('+ Complex business itinerary (4 flights)')
    console.log('+ Family booking coordination (4 passengers)')
    console.log('+ Corporate group management (3 passengers)')
    console.log('+ International long-haul operations')
    console.log('+ Same-day multi-city connections')
    console.log('+ Return flight coordination')
    console.log('+ Error handling and validation')
    console.log('+ Real airline operational scenarios')
  } catch (error: any) {
    console.error('! Error:', error.response?.data || error.message)
  }
}

demo()
