/**
 * Test endpoint to verify serverless function works
 */

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Test if we can import the modules
    const { validateResume } = await import('../dist/validators/resume-validator.js');
    
    return res.status(200).json({
      status: 'ok',
      message: 'Serverless function works',
      canImportValidator: typeof validateResume === 'function',
      nodeVersion: process.version,
      cwd: process.cwd(),
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
}
