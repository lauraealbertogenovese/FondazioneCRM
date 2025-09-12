import api from './api';

const systemService = {
  // Get real-time system health metrics
  async getSystemHealth() {
    try {
      const response = await api.get('/system/health');
      return response.data;
    } catch (error) {
      console.error('Error fetching system health:', error);
      // Fallback to basic health check
      return await this.getBasicHealthCheck();
    }
  },

  // Get service status for all microservices
  async getServiceStatus() {
    try {
      const services = [
        { name: 'Auth Service', url: process.env.REACT_APP_AUTH_SERVICE_URL + '/health', port: '3001' },
        { name: 'Patient Service', url: process.env.REACT_APP_PATIENT_SERVICE_URL + '/health', port: '3002' },
        { name: 'Clinical Service', url: process.env.REACT_APP_CLINICAL_SERVICE_URL + '/health', port: '3003' },
        { name: 'Group Service', url: process.env.REACT_APP_GROUP_SERVICE_URL + '/health', port: '3004' },
        { name: 'API Gateway', url: process.env.REACT_APP_API_BASE_URL + '/health', port: '3000' }
      ];        

      const statusChecks = await Promise.allSettled(
        services.map(async (service) => {
          try {
            const startTime = Date.now();
            const response = await fetch(service.url, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
              signal: AbortSignal.timeout(5000)
            });
            const responseTime = Date.now() - startTime;
            
            return {
              ...service,
              status: response.ok ? 'online' : 'error',
              responseTime,
              lastCheck: new Date().toISOString()
            };
          } catch (error) {
            return {
              ...service,
              status: 'offline',
              error: error.message,
              lastCheck: new Date().toISOString()
            };
          }
        })
      );

      return statusChecks.map((result, index) => 
        result.status === 'fulfilled' ? result.value : {
          ...services[index],
          status: 'error',
          error: result.reason?.message || 'Unknown error'
        }
      );
    } catch (error) {
      console.error('Error checking service status:', error);
      return [];
    }
  },

  // Basic health check when system endpoint is not available
  async getBasicHealthCheck() {
    try {
      // Check API Gateway health
      const response = await api.get('/health');
      const responseTime = Date.now();
      
      return {
        uptime: this.getSystemUptime(),
        status: 'operational',
        services: {
          apiGateway: {
            status: response.status === 200 ? 'healthy' : 'degraded',
            responseTime: responseTime
          }
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        uptime: 'Unknown',
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  },

  // Calculate approximate system uptime
  getSystemUptime() {
    // This is a simple approximation - in production you'd get this from the actual system
    const startTime = localStorage.getItem('systemStartTime');
    if (!startTime) {
      localStorage.setItem('systemStartTime', Date.now().toString());
      return '0 minutes';
    }

    const uptime = Date.now() - parseInt(startTime);
    const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((uptime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days} ${days === 1 ? 'giorno' : 'giorni'}, ${hours} ${hours === 1 ? 'ora' : 'ore'}`;
    } else if (hours > 0) {
      return `${hours} ${hours === 1 ? 'ora' : 'ore'}, ${minutes} ${minutes === 1 ? 'minuto' : 'minuti'}`;
    } else {
      return `${minutes} ${minutes === 1 ? 'minuto' : 'minuti'}`;
    }
  },

  // Get system statistics from various services
  async getSystemStatistics() {
    try {
      // Import the services properly
      const { patientService, clinicalService, groupService } = await import('./api');
      
      const [patientStats, clinicalStats, groupStats] = await Promise.allSettled([
        patientService.getStatistics(),
        clinicalService.getStatistics(),
        groupService.getGroupStatistics()
      ]);

      // Initialize stats object with defaults
      const stats = {
        totalPatients: 0,
        activePatients: 0,
        totalRecords: 0,
        recentRecords: 0,
        totalGroups: 0,
        activeGroups: 0
      };

      // Parse patient statistics
      if (patientStats.status === 'fulfilled' && patientStats.value?.data) {
        const patientData = patientStats.value.data.data || patientStats.value.data;
        console.log('Patient stats received:', patientData);
        stats.totalPatients = parseInt(patientData.total_patients) || 0;
        stats.activePatients = parseInt(patientData.active_patients) || 0;
      } else if (patientStats.status === 'rejected') {
        console.log('Patient stats error:', patientStats.reason);
      }

      // Parse clinical statistics  
      if (clinicalStats.status === 'fulfilled' && clinicalStats.value?.data) {
        const clinicalData = clinicalStats.value.data.data || clinicalStats.value.data;
        console.log('Clinical stats received:', clinicalData);
        stats.totalRecords = parseInt(clinicalData.total_clinical_records || clinicalData.total_records) || 0;
        stats.recentRecords = parseInt(clinicalData.recent_records) || 0;
      } else if (clinicalStats.status === 'rejected') {
        console.log('Clinical stats error:', clinicalStats.reason);
      }

      // Parse group statistics
      if (groupStats.status === 'fulfilled' && groupStats.value?.data) {
        const groupData = groupStats.value.data.data || groupStats.value.data;
        console.log('Group stats received:', groupData);
        stats.totalGroups = parseInt(groupData.total_groups) || 0;
        stats.activeGroups = parseInt(groupData.active_groups) || 0;
      } else if (groupStats.status === 'rejected') {
        console.log('Group stats error:', groupStats.reason);
      }

      console.log('Final stats:', stats);
      return stats;
    } catch (error) {
      console.error('Error fetching system statistics:', error);
      return {
        totalPatients: 0,
        activePatients: 0,
        totalRecords: 0,
        recentRecords: 0,
        totalGroups: 0,
        activeGroups: 0
      };
    }
  },

  // Get database connection status
  async getDatabaseStatus() {
    try {
      // Try to get patient count as a simple DB connectivity test
      const startTime = Date.now();
      const response = await api.get('/patients?limit=1');
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'connected',
        responseTime: responseTime,
        lastCheck: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        lastCheck: new Date().toISOString()
      };
    }
  }
};

export default systemService;
