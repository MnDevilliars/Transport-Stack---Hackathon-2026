/**
 * Real Delhi DTC Bus Routes, Service Types & Sequences
 */

const DELHI_ROUTES = {
  "DTC_502": {
    id: "DTC_502",
    routeNumber: "502",
    name: "Mehrauli Terminal ⇄ Kashmere Gate ISBT",
    type: "AC / Non-AC Low Floor Trunk",
    color: "#2563eb", // Blue
    headwayMinutes: 8,
    operatingHours: "05:00 - 23:30",
    stops: [
      "STP_MEHRAULI",
      "STP_SAKET",
      "STP_AIIMS",
      "STP_INA_COLONY",
      "STP_LODHI_ROAD",
      "STP_INDIA_GATE",
      "STP_CP_SHIVAJI",
      "STP_DELHI_GATE",
      "STP_RED_FORT",
      "STP_KG_ISBT"
    ]
  },
  "DTC_419": {
    id: "DTC_419",
    routeNumber: "419",
    name: "Dr. B.R. Ambedkar Nagar ⇄ Kashmere Gate ISBT",
    type: "Electric Green Delhi Express",
    color: "#16a34a", // Green
    headwayMinutes: 10,
    operatingHours: "05:30 - 23:00",
    stops: [
      "STP_AMBEDKAR_NAGAR",
      "STP_MOOLCHAND",
      "STP_LAJPAT_NAGAR",
      "STP_SOUTH_EXT",
      "STP_AIIMS",
      "STP_LODHI_ROAD",
      "STP_PRAGATI_MAIDAN",
      "STP_ITO",
      "STP_DELHI_GATE",
      "STP_RED_FORT",
      "STP_KG_ISBT"
    ]
  },
  "DTC_764": {
    id: "DTC_764",
    routeNumber: "764",
    name: "Najafgarh Terminal ⇄ Nehru Place Terminal",
    type: "High Capacity Cross-Suburban Arterial",
    color: "#d97706", // Amber
    headwayMinutes: 7,
    operatingHours: "05:00 - 23:45",
    stops: [
      "STP_NAJAFGARH",
      "STP_UTTAM_NAGAR",
      "STP_TILAK_NAGAR",
      "STP_JANAKPURI_DC",
      "STP_DELHI_CANTT",
      "STP_DHAULA_KUAN",
      "STP_MOTI_BAGH",
      "STP_NAUROJI_NAGAR",
      "STP_AIIMS",
      "STP_SOUTH_EXT",
      "STP_LAJPAT_NAGAR",
      "STP_MOOLCHAND",
      "STP_NEHRU_PLACE"
    ]
  },
  "DTC_85": {
    id: "DTC_85",
    routeNumber: "85",
    name: "Punjabi Bagh Terminal ⇄ Anand Vihar ISBT",
    type: "East-West Trans-Yamuna Connector",
    color: "#9333ea", // Purple
    headwayMinutes: 9,
    operatingHours: "05:15 - 23:15",
    stops: [
      "STP_PUNJABI_BAGH",
      "STP_RAJOURI_GARDEN",
      "STP_KAROL_BAGH",
      "STP_CP_SHIVAJI",
      "STP_ITO",
      "STP_LAXMI_NAGAR",
      "STP_PREET_VIHAR",
      "STP_ANAND_VIHAR"
    ]
  },
  "DTC_MUDRIKA": {
    id: "DTC_MUDRIKA",
    routeNumber: "OMS-Mudrika",
    name: "Ring Road Circular Trunk Service",
    type: "High Frequency Circular Express",
    color: "#dc2626", // Red
    headwayMinutes: 5,
    operatingHours: "24 Hours (Night Service Active)",
    stops: [
      "STP_PUNJABI_BAGH",
      "STP_RAJOURI_GARDEN",
      "STP_MAYAPURI",
      "STP_DELHI_CANTT",
      "STP_DHAULA_KUAN",
      "STP_MOTI_BAGH",
      "STP_NAUROJI_NAGAR",
      "STP_AIIMS",
      "STP_SOUTH_EXT",
      "STP_LAJPAT_NAGAR",
      "STP_ASHRAM",
      "STP_SARAI_KALE_KHAN",
      "STP_AKSHARDHAM",
      "STP_ANAND_VIHAR"
    ]
  }
};

module.exports = DELHI_ROUTES;

