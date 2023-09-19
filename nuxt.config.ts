import CsvImport from './content-plugins/csv-import/module'
// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig( {
    modules: [
        CsvImport,
        '@nuxt/content'
    ],
    content: {
        documentDriven: true,
    }
} )
