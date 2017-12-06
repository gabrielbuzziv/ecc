<template>
    <page>
        <el-tabs v-model="tabs" type="card">
            <el-tab-pane label="Postecipada" name="postecipada">
                <postecipada />
            </el-tab-pane>

            <el-tab-pane label="Antecipada" name="antecipada">
                <antecipada />
            </el-tab-pane>

            <el-tab-pane label="Diferido: Juros Pagos" name="jurospagos">
                <juros-pagos />
            </el-tab-pane>

            <el-tab-pane label="Diferido: Juros Capitalizados" name="juroscapitalizados">
                <juros-capitalizados />
            </el-tab-pane>
        </el-tabs>
    </page>
</template>

<script>
    import Postecipada from './Postecipada'
    import Antecipada from './Antecipada'
    import JurosPagos from './JurosPagos'
    import JurosCapitalizados from './JurosCapitalizados'

    export default {
        components: { Postecipada, Antecipada, JurosPagos, JurosCapitalizados },

        data () {
            return {
                tabs: 'postecipada'
            }
        }
    }
</script>