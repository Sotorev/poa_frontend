const config = {
  // Utilizamos el preset que combina JavaScript y TypeScript
  preset: 'ts-jest/presets/js-with-ts',
  // Establece el entorno de pruebas a jsdom para simular un navegador
  testEnvironment: 'jsdom',
  // Configuración de transformadores para TypeScript y JavaScript
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'ts-jest'
  },
  // Extensiones de archivos que se resolverán
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  // Mapea módulos para archivos estáticos y estilos
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/__mocks__/fileMock.js'
  },
  // Archivo de configuración adicional que se ejecuta antes de correr las pruebas
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};

export default config;