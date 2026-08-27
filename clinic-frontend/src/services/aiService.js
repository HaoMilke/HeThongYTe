import api from './api';

export const aiService = {
  analyzeSymptoms: (payload) => {
    const data = typeof payload === 'string' ? { symptoms: payload } : payload;
    return api.post('/api/ai/analyze', data);
  }
};

export default aiService;
