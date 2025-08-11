// Test file to debug ml5 exports
export async function debugML5Exports() {
  try {
    console.log('🔍 Debugging ml5 exports...');

    const ml5Module: Record<string, unknown> & { default?: Record<string, unknown> } = await import('ml5');
    console.log('📦 Raw ml5 module:', ml5Module);
    console.log('📋 Module keys:', Object.keys(ml5Module));

    // Check default export
    if ('default' in ml5Module) {
      console.log('✅ Has default export:', ml5Module.default);
      if (ml5Module.default) {
        console.log('📋 Default export keys:', Object.keys(ml5Module.default));
      }
    } else {
      console.log('❌ No default export');
    }

    // Check for neuralNetwork function
    if ('neuralNetwork' in ml5Module) {
      console.log('✅ neuralNetwork found in module:', typeof ml5Module.neuralNetwork);
    } else if (ml5Module.default && 'neuralNetwork' in ml5Module.default) {
      console.log('✅ neuralNetwork found in default export:', typeof ml5Module.default.neuralNetwork);
    } else {
      console.log('❌ neuralNetwork not found in module or default export');

      // Search for neuralNetwork in all exports
      const allExports = Object.values(ml5Module);
      const neuralNetworkExport = allExports.find((exp) => exp && typeof exp === 'object' && 'neuralNetwork' in exp);

      if (neuralNetworkExport) {
        console.log('🔍 Found neuralNetwork in nested export:', neuralNetworkExport);
      }
    }

    // Check if any export has neuralNetwork as a function
    const hasNeuralNetworkFn = Object.values(ml5Module).some(
      (exp) => exp && typeof exp === 'function' && exp.name === 'neuralNetwork'
    );

    if (hasNeuralNetworkFn) {
      console.log('✅ Found neuralNetwork function in exports');
    } else {
      console.log('❌ No neuralNetwork function found in exports');
    }

    return ml5Module;
  } catch (error) {
    console.error('💥 Error debugging ml5 exports:', error);
    throw error;
  }
}
