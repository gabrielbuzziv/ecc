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
                <div class="form-group col-md-12">
                    <input type="text" class="form-control" placeholder="Nº de Parcelas" v-model="form.parcelas">
                </div>
            </div>

            <div class="row">
                <div class="form-group col-md-6">
                    <el-radio-group v-model="tipo_taxa">
                        <el-radio-button label="Anual"></el-radio-button>
                        <el-radio-button label="Semestral"></el-radio-button>
                        <el-radio-button label="Trimestral"></el-radio-button>
                        <el-radio-button label="Bimestral"></el-radio-button>
                        <el-radio-button label="Mensal"></el-radio-button>
                    </el-radio-group>
                </div>

                <div class="form-group col-md-6">
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
                },
                tipo_taxa: 'Anual',
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

        watch: {
            tipo_taxa (newValue, oldValue) {
                if (newValue != oldValue) {
                    let expoent = this.getExpoent(oldValue)

                    switch (newValue) {
                        case 'Anual':
                            this.form.taxa = ((Math.pow(1 + (this.form.taxa / 100), expoent.anual) - 1) * 100).toFixed(1)
                            break
                        case 'Semestral':
                            this.form.taxa = ((Math.pow(1 + (this.form.taxa / 100), expoent.semestral) - 1) * 100).toFixed(4)
                            break
                        case 'Trimestral':
                            this.form.taxa = ((Math.pow(1 + (this.form.taxa / 100), expoent.trimestral) - 1) * 100).toFixed(4)
                            break
                        case 'Bimestral':
                            this.form.taxa = ((Math.pow(1 + (this.form.taxa / 100), expoent.bimestral) - 1) * 100).toFixed(4)
                            break
                        case 'Mensal':
                            this.form.taxa = ((Math.pow(1 + (this.form.taxa / 100), expoent.mensal) - 1) * 100).toFixed(4)
                            break
                    }
                }
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

                localStorage.setItem('sac.juroscapitalizados.saldo', this.form.saldo)
                localStorage.setItem('sac.juroscapitalizados.carencia', this.form.carencia)
                localStorage.setItem('sac.juroscapitalizados.parcelas', this.form.parcelas)
                localStorage.setItem('sac.juroscapitalizados.taxa', this.form.taxa)
                localStorage.setItem('sac.juroscapitalizados.tipo_taxa', this.tipo_taxa)

                for (let i = 0; i <= (parseInt(this.form.parcelas) + parseInt(this.form.carencia)); i ++) {
                    if (i == 0) {
                        let pmt = 0
                        let int = 0
                        let amortizacao = 0
                        let saldo = this.form.saldo
                        resultado.push({ pmt, int, amortizacao, saldo })
                    } else if (i <= this.form.carencia) {
                        let int = this.ajustaTaxa() * resultado[i - 1].saldo
                        let pmt = 0
                        let amortizacao = pmt - int
                        let saldo = resultado[i - 1].saldo - amortizacao
                        resultado.push({ pmt, int, amortizacao, saldo })
                    } else {
                        let int = this.ajustaTaxa() * resultado[i - 1].saldo
                        let amortizacao = resultado[this.form.carencia].saldo / this.form.parcelas
                        let saldo = resultado[i - 1].saldo - amortizacao
                        let pmt = amortizacao + int
                        resultado.push({ pmt, int, amortizacao, saldo })
                    }
                }

                this.resultado = resultado
            },

            ajustaTaxa () {
                if (this.tipo_taxa != 'Mensal') {
                    return (Math.pow(1 + (this.form.taxa / 100), this.getExpoent(this.tipo_taxa).mensal) - 1)
                }

                return this.form.taxa / 100
            },

            resetar () {
                this.form = {
                    saldo: '',
                    carencia: '',
                    parcelas: '',
                    taxa: '',
                    tipo_taxa: 'Anual',
                }
                this.resultado = []

                localStorage.setItem('sac.juroscapitalizados.saldo', this.form.saldo)
                localStorage.setItem('sac.juroscapitalizados.carencia', this.form.carencia)
                localStorage.setItem('sac.juroscapitalizados.parcelas', this.form.parcelas)
                localStorage.setItem('sac.juroscapitalizados.taxa', this.form.taxa)
                localStorage.setItem('sac.juroscapitalizados.tipo_taxa', this.tipo_taxa)
            },

            carencia (index) {
                return index > 0 && index <= this.form.carencia ? true : false
            },

            getExpoent (tipo) {
                switch (tipo) {
                    case 'Mensal':
                        return {
                            anual: 12,
                            semestral: 6,
                            trimestral: 3,
                            bimestral: 2
                        }
                    case 'Bimestral':
                        return {
                            anual: 12/2,
                            semestral: 6/2,
                            trimestral: 3/2,
                            mensal: 1/2
                        }
                    case 'Trimestral':
                        return {
                            anual: 12/3,
                            semestral: 6/3,
                            bimestral: 2/3,
                            mensal: 1/3
                        }
                    case 'Semestral':
                        return {
                            anual: 12/6,
                            trimestral: 3/6,
                            bimestral: 2/6,
                            mensal: 1/6
                        }
                    case 'Anual':
                        return {
                            semestral: 6/12,
                            trimestral: 3/12,
                            bimestral: 2/12,
                            mensal: 1/12
                        }
                }
            }
        },

        beforeMount () {
            this.form = {
                saldo: localStorage.getItem('sac.juroscapitalizados.saldo') || '',
                carencia: localStorage.getItem('sac.juroscapitalizados.carencia') || '',
                parcelas: localStorage.getItem('sac.juroscapitalizados.parcelas') || '',
                taxa: localStorage.getItem('sac.juroscapitalizados.taxa') || '',
                tipo_taxa: localStorage.getItem('sac.juroscapitalizados.tipo_taxa') || "Anual",
                quero: localStorage.getItem('sac.juroscapitalizados.quero') || '',
                tenho: localStorage.getItem('sac.juroscapitalizados.tenho') || ''
            }

            this.calcular()
        }
    }
</script>