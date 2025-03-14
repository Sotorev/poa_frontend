import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import ODSChart from '@/components/reports/GraficoODS'
import { useCurrentUser } from '@/hooks/use-current-user'

// Simular useCurrentUser para que devuelva un token (simulamos un usuario autenticado)
jest.mock('@/hooks/use-current-user', () => ({
  useCurrentUser: () => ({ token: 'fake-token' }),
}))

// Simulamos global.fetch para los endpoints usados por el componente
beforeEach(() => {
  jest.spyOn(global, 'fetch').mockImplementation((url, options) => {
    const urlString = url as string
    if (urlString.includes('/api/faculties')) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve([
            {
              facultyId: 1,
              name: 'Facultad 1',
              deanName: 'Decano 1',
              additionalInfo: null,
              annualBudget: 1000,
              isDeleted: false,
              isUniversityModule: true,
            },
          ]),
      } as Response)
    }
    if (urlString.includes('/api/reports/ods/event-count-by-ods')) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve([
            { odsId: 1, odsName: 'Fin de la pobreza', eventCount: 10 },
            { odsId: 2, odsName: 'Hambre cero', eventCount: 5 },
          ]),
      } as Response)
    }
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve([]),
    } as Response)
  })
})

afterEach(() => {
  jest.restoreAllMocks()
})

test('renders ODSChart, muestra loading y luego el gráfico', async () => {
  render(<ODSChart />)

  // Verifica que se muestre el mensaje de carga
  expect(screen.getByText(/Cargando datos/i)).toBeInTheDocument()

  // Espera a que finalice la carga y se renderice el título del gráfico
  await waitFor(() => {
    expect(screen.getByText(/Cantidad de eventos por Objetivo de Desarrollo Sostenible \(ODS\)/i)).toBeInTheDocument()
  })

  // Verifica que se muestre la opción "Todas" en el selector de facultades
  expect(screen.getByText('Todas')).toBeInTheDocument()

  // Verifica que se muestre al menos uno de los ODS definidos ("ODS 1" o "ODS 2")
  expect(screen.getByText(/ODS 1/i)).toBeInTheDocument()
  expect(screen.getByText(/ODS 2/i)).toBeInTheDocument()
})

test('filtra datos de ODS al cambiar la facultad seleccionada', async () => {
  render(<ODSChart />)

  // Espera a que se cargue el selector de facultades
  await waitFor(() => {
    expect(screen.getByText('Todas')).toBeInTheDocument()
  })

  // Abrir el selector de facultades y seleccionar "Facultad 1"
  const selectTrigger = screen.getByPlaceholderText('Seleccionar Facultad')
  fireEvent.click(selectTrigger)

  const facultyOption = await screen.findByText('Facultad 1')
  fireEvent.click(facultyOption)

  // Se espera que el gráfico actualice la descripción
  await waitFor(() => {
    expect(
      screen.getByText(/Distribución de eventos del POA por ODS para la Facultad de/i)
    ).toBeInTheDocument()
  })
})