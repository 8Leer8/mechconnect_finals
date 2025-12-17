// Region IX - Zamboanga Peninsula Address Data
// Coordinates are approximate center points for each city/municipality

export interface Barangay {
  name: string;
  coordinates?: [number, number]; // [latitude, longitude]
}

export interface Municipality {
  name: string;
  coordinates: [number, number]; // [latitude, longitude]
  barangays: Barangay[];
}

export interface Province {
  name: string;
  municipalities: Municipality[];
}

export const REGION_IX_DATA: Province[] = [
  {
    name: "Zamboanga del Norte",
    municipalities: [
      {
        name: "Dipolog City",
        coordinates: [8.5833, 123.3417],
        barangays: [
          { name: "Barra" },
          { name: "Biasong" },
          { name: "Central" },
          { name: "Cogon" },
          { name: "Dicayas" },
          { name: "Estaka" },
          { name: "Galas" },
          { name: "Gulayon" },
          { name: "Lugdungan" },
          { name: "Miputak" },
          { name: "Olingan" },
          { name: "Punta" },
          { name: "Santa Filomena" },
          { name: "Santa Isabel" },
          { name: "Sicayab" },
          { name: "Sinaman" },
          { name: "Turno" }
        ]
      },
      {
        name: "Dapitan City",
        coordinates: [8.6514, 123.4246],
        barangays: [
          { name: "Aliguay" },
          { name: "Bagting" },
          { name: "Ba-ao" },
          { name: "Banonong" },
          { name: "Barcelona" },
          { name: "Baylimango" },
          { name: "Canlucani" },
          { name: "Dawo" },
          { name: "Ilaya" },
          { name: "Larayan" },
          { name: "Liyang" },
          { name: "Maria Cristina" },
          { name: "Maria Uray" },
          { name: "Napo" },
          { name: "Owaon" },
          { name: "Polo" },
          { name: "Potol" },
          { name: "San Francisco" },
          { name: "San Nicolas" },
          { name: "San Vicente" },
          { name: "Santa Cruz" },
          { name: "Sinonoc" },
          { name: "Taguilon" },
          { name: "Talisay" },
          { name: "Zamboanguita" }
        ]
      },
      {
        name: "Polanco",
        coordinates: [8.5400, 123.3500],
        barangays: [
          { name: "Bacungan" },
          { name: "Balacanas" },
          { name: "Bulanay" },
          { name: "Calube" },
          { name: "Dansuli" },
          { name: "Don Pedro" },
          { name: "Guinles" },
          { name: "Lintangan" },
          { name: "Mauswagon" },
          { name: "Napilan" },
          { name: "New Casul" },
          { name: "Old Casul" },
          { name: "Poblacion" },
          { name: "Sianib" },
          { name: "Timbaboy" }
        ]
      },
      {
        name: "Manukan",
        coordinates: [8.5583, 123.2333],
        barangays: [
          { name: "Basak" },
          { name: "Capayas" },
          { name: "Diculom" },
          { name: "Linoguayan" },
          { name: "Lower Sulangon" },
          { name: "Mabuhay" },
          { name: "Palilan" },
          { name: "Poblacion" },
          { name: "San Jose" },
          { name: "Sinarapan" },
          { name: "Taguisian" },
          { name: "Upper Sulangon" }
        ]
      },
      {
        name: "Rizal",
        coordinates: [8.3000, 122.8833],
        barangays: [
          { name: "Dimalinao" },
          { name: "Gata" },
          { name: "Libertad" },
          { name: "Lower Dimalinao" },
          { name: "Mate" },
          { name: "Poblacion" },
          { name: "Salug" },
          { name: "Santa Cruz" },
          { name: "Seres" }
        ]
      }
    ]
  },
  {
    name: "Zamboanga del Sur",
    municipalities: [
      {
        name: "Pagadian City",
        coordinates: [7.8278, 123.4353],
        barangays: [
          { name: "Alegria" },
          { name: "Baguio" },
          { name: "Balangasan" },
          { name: "Balintawak" },
          { name: "Baloyboan" },
          { name: "Bomba" },
          { name: "Buenavista" },
          { name: "Bulatok" },
          { name: "Danlugan" },
          { name: "Dao-dao" },
          { name: "Daulan" },
          { name: "Dumagoc" },
          { name: "Gatas" },
          { name: "Gubawan" },
          { name: "Kagawasan" },
          { name: "Kahayagan" },
          { name: "Kalasan" },
          { name: "La Suerte" },
          { name: "Lala" },
          { name: "Lapidian" },
          { name: "Lemoyen" },
          { name: "Lenienza" },
          { name: "Lower Sibatang" },
          { name: "Lumbia" },
          { name: "Macasing" },
          { name: "Muricay" },
          { name: "Napolan" },
          { name: "Palpalan" },
          { name: "Pantad" },
          { name: "Poloyagan" },
          { name: "San Francisco" },
          { name: "San Jose" },
          { name: "San Pedro" },
          { name: "Santiago" },
          { name: "Tawagan Sur" },
          { name: "Tiguma" },
          { name: "Tuburan" },
          { name: "Upper Sibatang" },
          { name: "White Beach" }
        ]
      },
      {
        name: "Zamboanga City",
        coordinates: [6.9214, 122.0790],
        barangays: [
          { name: "Arena Blanco" },
          { name: "Ayala" },
          { name: "Baliwasan" },
          { name: "Bunguiao" },
          { name: "Busay" },
          { name: "Cabaluay" },
          { name: "Cabatangan" },
          { name: "Canelar" },
          { name: "Cawit" },
          { name: "Culianan" },
          { name: "Curuan" },
          { name: "Dulian" },
          { name: "Guiwan" },
          { name: "La Paz" },
          { name: "Labuan" },
          { name: "Lamisahan" },
          { name: "Landang Gua" },
          { name: "Landang Laum" },
          { name: "Lanzones" },
          { name: "Lapakan" },
          { name: "Latuan" },
          { name: "Lubigan" },
          { name: "Lumayang" },
          { name: "Lumbangan" },
          { name: "Lunzuran" },
          { name: "Maasin" },
          { name: "Malagutay" },
          { name: "Mampang" },
          { name: "Manalipa" },
          { name: "Manicahan" },
          { name: "Mariki" },
          { name: "Mercedes" },
          { name: "Muti" },
          { name: "Pamucutan" },
          { name: "Pasonanca" },
          { name: "Patalon" },
          { name: "Putik" },
          { name: "Quiniput" },
          { name: "Recodo" },
          { name: "Rio Hondo" },
          { name: "Salaan" },
          { name: "San Jose Cawa-cawa" },
          { name: "San Jose Gusu" },
          { name: "San Roque" },
          { name: "Sangali" },
          { name: "Santa Catalina" },
          { name: "Santa Maria" },
          { name: "Santo Niño" },
          { name: "Sibulao" },
          { name: "Sinubung" },
          { name: "Sinunoc" },
          { name: "Tagasilay" },
          { name: "Talabaan" },
          { name: "Talisayan" },
          { name: "Talon-talon" },
          { name: "Taluksangay" },
          { name: "Tetuan" },
          { name: "Tictapul" },
          { name: "Tigbalabag" },
          { name: "Tigtabon" },
          { name: "Tolosa" },
          { name: "Tugbungan" },
          { name: "Tulungatung" },
          { name: "Tumaga" },
          { name: "Tumalutab" },
          { name: "Vitali" },
          { name: "Zambowood" },
          { name: "Zone I" },
          { name: "Zone II" },
          { name: "Zone III" },
          { name: "Zone IV" }
        ]
      },
      {
        name: "Aurora",
        coordinates: [7.9833, 123.5667],
        barangays: [
          { name: "Anonang" },
          { name: "Baganian" },
          { name: "Alang-alang" },
          { name: "Balugo" },
          { name: "Inasagan" },
          { name: "Lomoyon" },
          { name: "Lower Bayao" },
          { name: "Poblacion" },
          { name: "Sapa Anding" },
          { name: "Upper Bayao" }
        ]
      },
      {
        name: "Molave",
        coordinates: [7.8333, 123.4833],
        barangays: [
          { name: "Ariosa" },
          { name: "Bag-ong Misamis" },
          { name: "Bogo" },
          { name: "Benigno Aquino" },
          { name: "Bagong Bataad" },
          { name: "Dipolo" },
          { name: "Silangit" },
          { name: "Lituban" },
          { name: "Mabuhay" },
          { name: "Parasan" },
          { name: "Poblacion" },
          { name: "San Isidro" }
        ]
      },
      {
        name: "Tigbao",
        coordinates: [7.7167, 123.0167],
        barangays: [
          { name: "Bag-ong Baroy" },
          { name: "Camanga" },
          { name: "Crossing Sipaon" },
          { name: "Kahayagan" },
          { name: "Luwakan" },
          { name: "Poblacion" },
          { name: "San Isidro" },
          { name: "San Juan" },
          { name: "San Roque" },
          { name: "Santa Cruz" }
        ]
      }
    ]
  },
  {
    name: "Zamboanga Sibugay",
    municipalities: [
      {
        name: "Ipil",
        coordinates: [7.7833, 122.5833],
        barangays: [
          { name: "Bacahan" },
          { name: "Baguitan" },
          { name: "Bangkerohan" },
          { name: "Belen" },
          { name: "Caparan" },
          { name: "Crossing Sibuguey" },
          { name: "Don Andres" },
          { name: "Doña Josefa" },
          { name: "Guituan" },
          { name: "Maasin" },
          { name: "Magdaup" },
          { name: "Minda" },
          { name: "Pangi" },
          { name: "Poblacion" },
          { name: "Sanito" },
          { name: "Suclayan" },
          { name: "Tenan" },
          { name: "Tirangan" },
          { name: "Tom-o" },
          { name: "Tomotomon" }
        ]
      },
      {
        name: "Naga",
        coordinates: [7.7500, 123.0500],
        barangays: [
          { name: "Baluno" },
          { name: "Baluyan" },
          { name: "Cabong" },
          { name: "Dandanan" },
          { name: "Little Baguio" },
          { name: "Lower Sulitan" },
          { name: "Mamangan" },
          { name: "Pisawak" },
          { name: "Poblacion" },
          { name: "San Jose" },
          { name: "Sulitan" },
          { name: "Tigbao" },
          { name: "Upper Sulitan" }
        ]
      },
      {
        name: "Alicia",
        coordinates: [7.6833, 122.8500],
        barangays: [
          { name: "Dawa-dawa" },
          { name: "Ipilan" },
          { name: "Katipunan" },
          { name: "Laparay" },
          { name: "Lower Balas" },
          { name: "Lubay" },
          { name: "Poblacion" },
          { name: "Sanggay" },
          { name: "Seres" },
          { name: "Upper Balas" }
        ]
      },
      {
        name: "Buug",
        coordinates: [7.7333, 123.0833],
        barangays: [
          { name: "Bliss" },
          { name: "Bulaan" },
          { name: "Danlugan" },
          { name: "Disakan" },
          { name: "Guitom" },
          { name: "Kalilangan" },
          { name: "Limas" },
          { name: "Lower Poblacion" },
          { name: "Mabuhay" },
          { name: "Mania" },
          { name: "Marupay" },
          { name: "Pamintayan" },
          { name: "Pling" },
          { name: "Upper Poblacion" }
        ]
      },
      {
        name: "Tungawan",
        coordinates: [7.5167, 122.3833],
        barangays: [
          { name: "Capisan" },
          { name: "Langatian" },
          { name: "Liangas" },
          { name: "Libertad" },
          { name: "Lower Tungawan" },
          { name: "Poblacion" },
          { name: "San Isidro" },
          { name: "Sarawagan" },
          { name: "Upper Tungawan" }
        ]
      }
    ]
  }
];

// Helper function to get all municipalities from Region IX
export const getAllMunicipalities = (): Array<{
  municipality: string;
  province: string;
  coordinates: [number, number];
}> => {
  const result: Array<{
    municipality: string;
    province: string;
    coordinates: [number, number];
  }> = [];
  
  REGION_IX_DATA.forEach(province => {
    province.municipalities.forEach(muni => {
      result.push({
        municipality: muni.name,
        province: province.name,
        coordinates: muni.coordinates
      });
    });
  });
  
  return result;
};

// Helper function to get barangays for a specific municipality
export const getBarangaysForMunicipality = (
  municipalityName: string,
  provinceName?: string
): Barangay[] => {
  for (const province of REGION_IX_DATA) {
    if (provinceName && province.name !== provinceName) continue;
    
    const municipality = province.municipalities.find(
      m => m.name === municipalityName
    );
    
    if (municipality) {
      return municipality.barangays;
    }
  }
  
  return [];
};

// Helper function to get coordinates for a specific municipality
export const getMunicipalityCoordinates = (
  municipalityName: string,
  provinceName?: string
): [number, number] | null => {
  for (const province of REGION_IX_DATA) {
    if (provinceName && province.name !== provinceName) continue;
    
    const municipality = province.municipalities.find(
      m => m.name === municipalityName
    );
    
    if (municipality) {
      return municipality.coordinates;
    }
  }
  
  return null;
};

// Region IX bounds for map restriction
export const REGION_IX_BOUNDS: [[number, number], [number, number]] = [
  [6.5, 121.5], // Southwest corner [lat, lng]
  [9.0, 124.0]  // Northeast corner [lat, lng]
];

// Center of Region IX (approximate)
export const REGION_IX_CENTER: [number, number] = [7.7, 122.8];
