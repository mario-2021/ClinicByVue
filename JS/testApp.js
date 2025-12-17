/* app.js
   Replace API_BASE and AUTH_HEADER with real values from the Postman doc.
   For the test, the API returns static data; we filter for Jessica Taylor.
   headers: {
    "Authorization": "Basic Y29hbGl0aW9uOnNraWxscy10ZXN0",
    "Content-Type": "application/json"
  }
*/


Vue.component('patient-list', {
  template: '#patient-list-template',
  props: ['patients', 'selectedPatient']
});

Vue.component('patient-details', {
  template: '#patient-details-template',
  props: ['patient'],
  
  computed: {
    // systolic() {
    //   return this.patient.diagnosis_history[0].blood_pressure?.systolic?.value ?? 'N/A';
    // },
    // diastolic() {
    //   return this.patient.diagnosis_history[0].blood_pressure?.diastolic?.value ?? 'N/A';
    // }

    systolic() {
      if (!this.patient || !this.patient.diagnosis_history || !this.patient.diagnosis_history.length) {
        return 'N/A';
      }
    return this.patient.diagnosis_history[0].blood_pressure.systolic.value;
    },

    diastolic() {
      if (!this.patient || !this.patient.diagnosis_history || !this.patient.diagnosis_history.length) {
        return 'N/A';
      }
    return this.patient.diagnosis_history[0].blood_pressure.diastolic.value;
    }

  },

  mounted() {
    this.drawChart();
  },

  watch: {
    patient() {
      this.drawChart();
    }
  },

  methods: {
    drawChart() {
      if (!this.patient.diagnosis_history[0].blood_pressure) return;

      const ctx = this.$refs.bpChart.getContext('2d');

      if (this.chart) {
        this.chart.destroy();
      }

      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Systolic', 'Diastolic'],
          datasets: [{
            data: [
              this.systolic,
              this.diastolic
            ],
            fill: false,
            borderWidth: 2
          }]
        }
      });
    }
  }
});

new Vue({
  el: '#app',

  data() {
    return {
      patients: [],
      selectedPatient: null
    }
  },

  computed: {
    hasVitals() {
      return (
        this.patients &&
        this.patients.diagnosis_history &&
        this.patients.diagnosis_history.length
      );
    },

    respiratoryRate() {
      return this.patients.diagnosis_history.respiratory_rate.value;
    },

    temperature() {
      if (!this.hasVitals) return 'N/A';
      return this.patients.diagnosis_history[0].temperature.value;
    },

    heartRate() {
      if (!this.hasVitals) return 'N/A';
      return this.patients.diagnosis_history[0].heart_rate.value;
    }
  },

  mounted() {
    this.getPatients();
  },

  methods: {
    getPatients() {
      const username = 'coalition';
      const password = 'skills-test';
      const token = btoa(`${username}:${password}`);

      fetch('https://fedskillstest.coalitiontechnologies.workers.dev', {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${token}`,
          'Content-Type': 'application/json'
        }
      })
      .then(r => r.json())
      .then(data => {
        this.patients = Array.isArray(data) ? data : [];
          // console.log(this.patients[3].diagnosis_history[0].blood_pressure.systolic.levels);
          // console.log(this.patients[3].diagnosis_history[0].blood_pressure.systolic.value);
          // console.log(this.respiratoryRate);
        this.selectedPatient = data.find(
          p => p.diagnosis_history && p.diagnosis_history.length
          ) || null;
      });
    },

    selectPatient(patients) {
      this.selectedPatient = patients;
    }
  }
});