<template>
    <panel>
        <form action="" @submit.prevent="calcular">
            <div class="row">
                <div class="form-group col-md-6">
                    <input type="text" class="form-control" placeholder="Saldo" v-model="form.saldo">
                </div>

                <div class="form-group col-md-6">
                    <input type="text" class="form-control" placeholder="Carência" v-model="form.carencia">
                </div>
            </div>

            <div class="row">
                <div class="form-group col-md-6">
                    <input type="text" class="form-control" placeholder="Nº de Parcelas" v-model="form.parcelas">
                </div>

                <div class="form-group col-md-2">
                    <el-radio-group v-model="form.tipo_taxa" @change="atualizaTaxa">
                        <el-radio-button label="Anual"></el-radio-button>
                        <el-radio-button label="Mensal"></el-radio-button>
                    </el-radio-group>
                </div>

                <div class="form-group col-md-4">
                    <div class="input-group">
                        <input type="text" class="form-control" placeholder="Taxa" v-model="form.taxa">
                        <div class="input-group-addon">%</div>
                    </div>
                </div>
            </div>

            <div class="form-group">
                <button type="submit" class="btn btn-success">
                    <i class="mdi mdi-calculator margin-right-5"></i>
                    Calcular
                </button>

                <button class="btn btn-default" @click.prevent="resetar">
                    <i class="mdi mdi-refresh margin-right-5"></i>
                    Resetar
                </button>
            </div>
        </form>

        <div class="resultado" v-if="resultado.length">
            <table class="table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>PMT</th>
                        <th>INT</th>
                        <th>Amortização</th>
                        <th>Saldo Devedor</th>
                    </tr>
                </thead>

                <tbody>
                    <tr :class="{ 'carencia': carencia(index) }" v-for="res, index in resultado">
                        <td>{{ index }}</td>
                        <td>R$ {{ res.pmt | fixed }}</td>
                        <td>R$ {{ res.int | fixed }}</td>
                        <td>
                            <span v-if="carencia(index)">
                                <span class="label label-primary">Carência</span>
                            </span>
                            <span v-else>R$ {{ res.amortizacao | fixed }}</span>
                        </td>
                        <td>R$ {{ res.saldo | fixed }}</td>
                    </tr>
                </tbody>

                <tfoot>
                    <tr>
                        <th>Total</th>
                        <th>R$ {{ totalPmt | fixed }}</th>
                        <th>R$ {{ totalInt | fixed }}</th>
                        <th>R$ {{ totalAmortizacao | fixed }}</th>
                        <th></th>
                    </tr>
                </tfoot>
            </table>
        </div>

    </panel>
</template>

<script>
    export default {
        data () {
            return {
                form: {
                    saldo: '',
                    carencia: '',
                    parcelas: '',
                    taxa: '',
                    tipo_taxa: 'Anual',
                    pmt: '',
                },
                resultado: []
            }
        },

        computed: {
            totalPmt () {
                return this.resultado.length ? this.resultado.reduce((carry, res) => carry + parseFloat(res.pmt), 0) : 0
            },

            totalInt () {
                return this.resultado.length ? this.resultado.reduce((carry, res) => carry + parseFloat(res.int), 0) : 0
            },

            totalAmortizacao () {
                return this.resultado.length ? this.resultado.reduce((carry, res) => carry + parseFloat(res.amortizacao), 0) : 0
            }
        },

        filters: {
            fixed (data) {
                return parseFloat(data).toFixed(2)
            }
        },

        methods: {
            calcular () {
                if ((this.form.saldo == 0 || this.form.saldo == '' || this.form.saldo == null)
                    || (this.form.parcelas == 0 || this.form.parcelas == '' || this.form.parcelas == null)
                    || (this.form.taxa == 0 || this.form.taxa == '' || this.form.taxa == null)) {
                    return false
                }

                let resultado = []

                localStorage.setItem('sac.jurospagos.saldo', this.form.saldo)
                localStorage.setItem('sac.jurospagos.carencia', this.form.carencia)
                localStorage.setItem('sac.jurospagos.parcelas', this.form.parcelas)
                localStorage.setItem('sac.jurospagos.taxa', this.form.taxa)
                localStorage.setItem('sac.jurospagos.tipo_taxa', this.form.tipo_taxa)
                localStorage.setItem('sac.jurospagos.pmt', this.form.pmt)

                for (let i = 0; i <= (parseInt(this.form.parcelas) + parseInt(this.form.carencia)); i ++) {
                    if (i == 0) {
                        let pmt = 0
                        let int = 0
                        let amortizacao = 0
                        let saldo = this.form.saldo
                        resultado.push({ pmt, int, amortizacao, saldo })
                    } else if (i <= this.form.carencia) {
                        let int = this.ajustaTaxa() * resultado[i - 1].saldo
                        let amortizacao = 0
                        let saldo = this.form.saldo
                        let pmt = amortizacao + int
                        resultado.push({ pmt, int, amortizacao, saldo })
                    } else {
                        let int = this.ajustaTaxa() * resultado[i - 1].saldo
                        let amortizacao = this.form.saldo / this.form.parcelas
                        let saldo = resultado[i - 1].saldo - amortizacao
                        let pmt = amortizacao + int
                        resultado.push({ pmt, int, amortizacao, saldo })
                    }
                }

                this.resultado = resultado
            },

            ajustaTaxa () {
                if (this.form.tipo_taxa == 'Anual') {
                    return (this.form.taxa / this.form.parcelas) / 100
                }

                return this.form.taxa / 100
            },

            atualizaTaxa (tipo) {
                switch (tipo) {
                    case 'Anual':
                        this.form.taxa = this.form.taxa * this.form.parcelas
                        break
                    case 'Mensal':
                        this.form.taxa = this.form.taxa / this.form.parcelas
                        break
                }
            },

            resetar () {
                this.form = {
                    saldo: '',
                    carencia: '',
                    parcelas: '',
                    taxa: '',
                    tipo_taxa: 'Anual',
                    pmt: ''
                }
                this.resultado = []

                localStorage.setItem('sac.jurospagos.saldo', this.form.saldo)
                localStorage.setItem('sac.jurospagos.carencia', this.form.carencia)
                localStorage.setItem('sac.jurospagos.parcelas', this.form.parcelas)
                localStorage.setItem('sac.jurospagos.taxa', this.form.taxa)
                localStorage.setItem('sac.jurospagos.tipo_taxa', this.form.tipo_taxa)
                localStorage.setItem('sac.jurospagos.pmt', this.form.pmt)
            },

            carencia (index) {
                return index > 0 && index <= this.form.carencia ? true : false
            }
        },

        beforeMount () {
            this.form = {
                saldo: localStorage.getItem('sac.jurospagos.saldo') || '',
                carencia: localStorage.getItem('sac.jurospagos.carencia') || '',
                parcelas: localStorage.getItem('sac.jurospagos.parcelas') || '',
                taxa: localStorage.getItem('sac.jurospagos.taxa') || '',
                tipo_taxa: localStorage.getItem('sac.jurospagos.tipo_taxa') || "Anual",
                pmt: localStorage.getItem('sac.jurospagos.pmt') || ''
            }

            this.calcular()
        }
    }
</script>